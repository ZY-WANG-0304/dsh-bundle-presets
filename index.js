/**
 * dsh-bundle-presets — Host half.
 *
 * Saves the profile's active bundle list under a name, applies a saved list
 * through `pluginManager.setBundleEnabled()` (so writes take the profile write
 * lock, compatibility checks, protected-bundle refusals and HMR coordination),
 * and keeps the pre-switch list for one-step undo.
 *
 * The plugin never edits `package.json` or `cordis.patch.yml` itself: the
 * plugin manager owns those files, and this module only keeps its own preset
 * file next to them.
 */
import { existsSync } from 'node:fs'
import { open, readFile, rename, stat, unlink, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { normalizePresetName, normalizeTarget, planSwitch } from './plan.js'

export const name = 'dsh-bundle-presets'

/** Services this plugin needs before it activates. */
export const inject = ['pluginManager', 'webServer']

const ROUTE_PREFIX = '/api/bundle-presets'
const STATE_FILE = 'bundle-presets.json'
const MAX_BODY_BYTES = 64 * 1024
const LOCK_WAIT_MS = 2000
const LOCK_STALE_MS = 15000
const LOCK_RETRY_MS = 25

/**
 * Whether a WHATWG hostname names the local loopback authority.
 * Mirrors the fence the shipped `/api` uses: `localhost`, `[::1]`, or 127/8.
 * @param {string} hostname
 * @returns {boolean}
 */
function isLoopbackHostname(hostname) {
  if (hostname === 'localhost' || hostname === '[::1]') return true
  const parts = hostname.split('.')
  return parts.length === 4
    && parts[0] === '127'
    && parts.every(part => /^\d{1,3}$/.test(part) && Number(part) <= 255)
}

/**
 * Whether a socket peer address is loopback.
 * @param {string | undefined} address
 * @returns {boolean}
 */
function isLoopbackAddress(address) {
  if (address === undefined) return false
  return address === '::1'
    || address.startsWith('127.')
    || address.startsWith('::ffff:127.')
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

/**
 * @param {import('@deepseek-ai/cordis').Context} ctx
 */
export function apply(ctx) {
  const profile = ctx.get('profileContext')
  const manager = ctx.get('pluginManager')
  const server = ctx.get('webServer')
  if (profile === undefined || manager === undefined || server === undefined) {
    // `inject` parks this plugin until both services exist, so this arm only
    // runs when a host supplies them without profile facts.
    console.warn('dsh-bundle-presets: no profile context; staying idle')
    return
  }

  const statePath = join(profile.dir, STATE_FILE)
  /** Set when a damaged state file was moved aside; reported until the next write. */
  let recoveredPath = null

  /**
   * In-process queue: switches and state writes never overlap here. The file
   * lock below covers the other DSH processes sharing this profile.
   */
  let tail = Promise.resolve()
  const enqueue = task => {
    const run = tail.then(task, task)
    tail = run.then(() => {}, () => {})
    return run
  }

  const lockPath = `${statePath}.lock`
  const stealPath = `${lockPath}.steal`

  const readLock = () => readFile(lockPath, 'utf8').catch(() => undefined)

  const lockAge = async token => {
    try {
      const info = JSON.parse(token)
      if (typeof info?.at === 'number') return Date.now() - info.at
    } catch {
      // Unreadable content: fall back to the file's own age.
    }
    try {
      const details = await stat(lockPath)
      return Date.now() - details.mtimeMs
    } catch {
      return 0
    }
  }

  /**
   * Remove a stale lock under a second, single-winner lock. Without that guard
   * two processes can both judge the same file stale and each delete the lock
   * the other has just created, which is exactly the lost update this lock
   * exists to prevent.
   * @returns {Promise<boolean>} whether a stale lock was removed
   */
  const breakStaleLock = async () => {
    let guard
    try {
      guard = await open(stealPath, 'wx', 0o600)
    } catch {
      return false
    }
    try {
      const token = await readLock()
      if (token === undefined) return true
      if (!((await lockAge(token)) > LOCK_STALE_MS)) return false
      if ((await readLock()) !== token) return false
      await unlink(lockPath).catch(() => {})
      return true
    } finally {
      await guard.close().catch(() => {})
      await unlink(stealPath).catch(() => {})
    }
  }

  const acquireLock = async () => {
    const deadline = Date.now() + LOCK_WAIT_MS
    for (;;) {
      const token = JSON.stringify({
        pid: process.pid,
        at: Date.now(),
        nonce: Math.random().toString(36).slice(2),
      })
      let handle
      try {
        handle = await open(lockPath, 'wx', 0o600)
      } catch (error) {
        if (error?.code !== 'EEXIST') throw error
        if (await breakStaleLock()) continue
        if (Date.now() > deadline) throw Object.assign(new Error('preset file is busy'), { status: 503, code: 'busy' })
        await sleep(LOCK_RETRY_MS)
        continue
      }
      try {
        await handle.writeFile(token)
      } catch (error) {
        await handle.close().catch(() => {})
        await unlink(lockPath).catch(() => {})
        throw error
      }
      await handle.close()
      return token
    }
  }

  const withStateLock = async task => {
    const token = await acquireLock()
    try {
      return await task()
    } finally {
      // Remove only our own lock: a stale-steal elsewhere may have replaced it.
      if ((await readLock()) === token) await unlink(lockPath).catch(() => {})
    }
  }

  const sanitizePreset = value => {
    if (value === null || typeof value !== 'object' || !Array.isArray(value.bundles)) return undefined
    return {
      name: typeof value.name === 'string' ? value.name : 'previous',
      bundles: value.bundles.filter(item => typeof item === 'string'),
      note: typeof value.note === 'string' ? value.note : '',
      savedAt: typeof value.savedAt === 'string'
        ? value.savedAt
        : typeof value.at === 'string' ? value.at : new Date().toISOString(),
    }
  }

  const readState = async () => {
    let raw
    try {
      raw = await readFile(statePath, 'utf8')
    } catch (error) {
      if (error?.code === 'ENOENT') return { presets: [], last: null, applied: null }
      throw error
    }
    try {
      const parsed = JSON.parse(raw)
      const presets = Array.isArray(parsed?.presets)
        ? parsed.presets.map(sanitizePreset).filter(Boolean)
        : []
      const last = sanitizePreset(parsed?.last) ?? null
      // Older files only recorded the undo snapshot; its name is `before <preset>`,
      // which is enough to know what was applied last.
      const applied = typeof parsed?.applied === 'string'
        ? parsed.applied
        : last !== null && last.name.startsWith('before ') ? last.name.slice('before '.length) : null
      return { presets, last, applied }
    } catch {
      // A half-written or hand-edited file must not brick the page: keep the
      // damaged copy and start from an empty set.
      const backup = `${statePath}.corrupt-${Date.now()}`
      try {
        await rename(statePath, backup)
        recoveredPath = backup
      } catch {
        recoveredPath = null
      }
      return { presets: [], last: null, applied: null }
    }
  }

  const writeState = async state => {
    const temporary = `${statePath}.${process.pid}.${Math.random().toString(36).slice(2)}.tmp`
    await writeFile(temporary, `${JSON.stringify(state, null, 2)}\n`, { mode: 0o600 })
    // Windows antivirus and indexers hold the target open for a moment, so a
    // rename over it can fail with EPERM/EACCES/EBUSY; retry within a bound.
    for (let attempt = 0; ; attempt += 1) {
      try {
        await rename(temporary, statePath)
        break
      } catch (error) {
        const retryable = error?.code === 'EPERM' || error?.code === 'EACCES' || error?.code === 'EBUSY'
        if (!retryable || attempt >= 4) {
          await unlink(temporary).catch(() => {})
          throw error
        }
        await sleep(20 * (attempt + 1))
      }
    }
    recoveredPath = null
  }

  /**
   * Read-modify-write under the file lock only. Callers already inside
   * {@link enqueue} use this; route entries use {@link mutateState}.
   * @param {(state: object) => Promise<{ result?: unknown, write?: boolean }> | { result?: unknown, write?: boolean }} task
   */
  const mutateLocked = task => withStateLock(async () => {
    const state = await readState()
    const outcome = await task(state)
    if (outcome?.write !== false) await writeState(state)
    return outcome?.result
  })

  const mutateState = task => enqueue(() => mutateLocked(task))

  const selection = async () => {
    const bundles = await manager.listBundles()
    return {
      bundles,
      selected: bundles.filter(bundle => bundle.enabled).map(bundle => bundle.name),
    }
  }

  const view = async () => {
    const { bundles, selected } = await selection()
    const state = await readState()
    return {
      profile: profile.name,
      recoveredPath: recoveredPath !== null && existsSync(recoveredPath) ? recoveredPath : null,
      selected,
      presets: state.presets,
      last: state.last,
      applied: state.applied ?? null,
      bundles: bundles.map(bundle => ({
        name: bundle.name,
        enabled: bundle.enabled,
        version: bundle.version ?? null,
        official: bundle.official === true,
        removable: bundle.removable === true,
        availability: bundle.availability ?? null,
        installed: bundle.installed === true,
        readOnlyReason: bundle.readOnlyReason ?? null,
        error: bundle.error?.code ?? null,
        title: bundle.meta?.title ?? null,
        description: bundle.meta?.description ?? bundle.description ?? null,
        // Data URLs are sent only when small: the editor lists every bundle.
        icon: typeof bundle.meta?.icon === 'string' && bundle.meta.icon.length <= 20000 ? bundle.meta.icon : null,
      })),
    }
  }

  const step = async (bundle, enabled) => {
    try {
      const result = await manager.setBundleEnabled(bundle, enabled)
      return {
        name: bundle,
        enabled,
        application: result?.application ?? 'unknown',
        restartReason: result?.restartReason ?? null,
        changed: result?.changed === true,
        error: result?.error?.code ?? null,
      }
    } catch (error) {
      return {
        name: bundle,
        enabled,
        application: 'failed',
        restartReason: null,
        changed: false,
        error: error?.message ?? String(error),
      }
    }
  }

  /**
   * Apply one bundle list through the plugin manager. Enables first and
   * disables second so the browser bundle survives the transition; a failed
   * step that already changed the manifest is reverted before returning.
   * @param {string[]} target desired bundle names
   */
  const switchTo = async target => {
    const { bundles, selected } = await selection()
    const { plan, blocked } = planSwitch(selected, target, bundles)
    if (blocked.length > 0) {
      return { plan, blocked, steps: [], selected, rolledBack: false, revertFailed: false }
    }

    const steps = []
    let revertFailed = false

    /** @returns {Promise<boolean>} whether to stop */
    const run = async (bundle, enabled) => {
      const outcome = await step(bundle, enabled)
      steps.push(outcome)
      if (outcome.application !== 'failed') return false
      if (!outcome.changed) return true
      const revert = await step(bundle, !enabled)
      steps.push({ ...revert, rollback: true })
      if (revert.application === 'failed') revertFailed = true
      return true
    }

    for (const bundle of plan.enable) {
      if (await run(bundle, true)) {
        return { plan, blocked, steps, selected: (await selection()).selected, rolledBack: !revertFailed, revertFailed }
      }
    }
    for (const bundle of plan.disable) {
      if (await run(bundle, false)) {
        return { plan, blocked, steps, selected: (await selection()).selected, rolledBack: !revertFailed, revertFailed }
      }
    }
    return { plan, blocked, steps, selected: (await selection()).selected, rolledBack: false, revertFailed: false }
  }

  /** @param {import('node:http').IncomingMessage} req */
  const readBody = req =>
    new Promise((resolve, reject) => {
      let size = 0
      const chunks = []
      req.on('data', chunk => {
        size += chunk.length
        if (size > MAX_BODY_BYTES) {
          // Drain instead of destroying: a keep-alive connection must not
          // carry an unread body into the next request.
          req.resume()
          reject(Object.assign(new Error('request body is too large'), { status: 413 }))
          return
        }
        chunks.push(chunk)
      })
      req.on('end', () => {
        if (size > MAX_BODY_BYTES) return
        if (chunks.length === 0) return resolve({})
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')))
        } catch {
          reject(Object.assign(new Error('request body is not valid JSON'), { status: 400 }))
        }
      })
      req.on('error', reject)
    })

  /**
   * Browser fence, mirroring the shipped `/api` rules: the Host header must
   * name a loopback authority (DNS rebinding cannot forge it), cross-site
   * fetch metadata is refused, and an Origin must be this same authority.
   */
  const isTrustedRequest = req => {
    if (!isLoopbackAddress(req.socket.remoteAddress)) return false
    const host = req.headers.host
    if (typeof host !== 'string' || host.length === 0) return false
    let hostUrl
    try {
      hostUrl = new URL(`http://${host}`)
    } catch {
      return false
    }
    if (!isLoopbackHostname(hostUrl.hostname)) return false
    if (req.headers['sec-fetch-site'] === 'cross-site') return false
    const origin = req.headers.origin
    if (origin === undefined) return true
    try {
      return new URL(origin).host === hostUrl.host
    } catch {
      return false
    }
  }

  const reply = (res, status, value) => {
    if (res.destroyed || res.writableEnded) return
    const body = JSON.stringify(value)
    res.writeHead(status, {
      'content-type': 'application/json; charset=utf-8',
      'content-length': Buffer.byteLength(body),
      'cache-control': 'no-store',
    })
    res.end(body)
  }

  const route = (path, handler) =>
    ctx.effect(() => server.register({
      kind: 'exact',
      path: `${ROUTE_PREFIX}${path}`,
      handler: (req, res) => {
        if (!isTrustedRequest(req)) return reply(res, 403, { error: 'untrusted-request' })
        Promise.resolve(handler(req, res)).catch(error => {
          if (!res.headersSent) reply(res, error?.status ?? 500, { error: error?.code ?? error?.message ?? String(error) })
          else res.destroy()
        })
      },
    }))

  route('/state', async (req, res) => {
    if (req.method !== 'GET') return reply(res, 405, { error: 'get-only' })
    reply(res, 200, await view())
  })

  route('/save', async (req, res) => {
    if (req.method !== 'POST') return reply(res, 405, { error: 'post-only' })
    const body = await readBody(req)
    const name = normalizePresetName(body.name)
    if (name === undefined) return reply(res, 400, { error: 'invalid-name' })
    const note = typeof body.note === 'string' ? body.note.slice(0, 200) : ''
    const { bundles, selected } = await selection()
    const result = await mutateState(state => {
      const index = state.presets.findIndex(item => item.name === name)
      if (index !== -1 && body.overwrite !== true) return { result: { conflict: true }, write: false }
      const preset = {
        name,
        bundles: normalizeTarget(selected, new Set(bundles.map(bundle => bundle.name))),
        note,
        savedAt: new Date().toISOString(),
      }
      if (index === -1) state.presets.push(preset)
      else state.presets[index] = preset
      return { result: { preset } }
    })
    if (result.conflict === true) return reply(res, 409, { error: 'name-exists', name })
    reply(res, 200, { saved: result.preset })
  })

  route('/preview', async (req, res) => {
    if (req.method !== 'GET') return reply(res, 405, { error: 'get-only' })
    const name = normalizePresetName(new URL(req.url ?? '/', 'http://loopback').searchParams.get('name'))
    if (name === undefined) return reply(res, 400, { error: 'invalid-name' })
    const state = await readState()
    const preset = state.presets.find(item => item.name === name)
    if (preset === undefined) return reply(res, 404, { error: 'unknown-preset' })
    const { bundles, selected } = await selection()
    const { plan, blocked } = planSwitch(selected, preset.bundles, bundles)
    reply(res, 200, { preset: name, plan, blocked })
  })

  route('/update', async (req, res) => {
    if (req.method !== 'POST') return reply(res, 405, { error: 'post-only' })
    const body = await readBody(req)
    const name = normalizePresetName(body.name)
    if (name === undefined) return reply(res, 400, { error: 'invalid-name' })
    if (!Array.isArray(body.bundles)) return reply(res, 400, { error: 'bundles-required' })
    const { bundles } = await selection()
    const known = new Set(bundles.map(bundle => bundle.name))
    const requested = [...new Set(body.bundles.filter(item => typeof item === 'string'))]
    const kept = requested.filter(item => known.has(item))
    const unknown = requested.filter(item => !known.has(item))
    const note = typeof body.note === 'string' ? body.note.slice(0, 200) : undefined
    const result = await mutateState(state => {
      const index = state.presets.findIndex(item => item.name === name)
      if (index === -1) return { result: { missing: true }, write: false }
      const previous = state.presets[index]
      state.presets[index] = {
        name,
        bundles: normalizeTarget(kept, known),
        note: note ?? previous.note ?? '',
        savedAt: new Date().toISOString(),
      }
      return { result: { preset: state.presets[index], unknown } }
    })
    if (result.missing === true) return reply(res, 404, { error: 'unknown-preset' })
    reply(res, 200, result)
  })

  route('/apply', async (req, res) => {
    if (req.method !== 'POST') return reply(res, 405, { error: 'post-only' })
    const body = await readBody(req)
    const name = normalizePresetName(body.name)
    if (name === undefined) return reply(res, 400, { error: 'invalid-name' })
    const preset = (await readState()).presets.find(item => item.name === name)
    if (preset === undefined) return reply(res, 404, { error: 'unknown-preset' })
    const outcome = await enqueue(async () => {
      const before = (await selection()).selected
      const result = await switchTo(preset.bundles)
      if (result.blocked.length > 0) {
        return { error: 'unappliable', blocked: result.blocked, plan: result.plan }
      }
      // Record which preset this selection came from, so the switcher can name it
      // even when two presets reduce to the same applicable bundles. The undo
      // snapshot is written only when the manifest actually moved: a partial
      // switch still needs a way back.
      const changed = result.steps.some(step => step.changed)
      await mutateLocked(state => {
        state.applied = name
        if (changed) state.last = { name: `before ${name}`, bundles: before, note: '', savedAt: new Date().toISOString() }
        return { result: null }
      })
      return { applied: name, ...result }
    })
    reply(res, 200, outcome)
  })

  route('/undo', async (req, res) => {
    if (req.method !== 'POST') return reply(res, 405, { error: 'post-only' })
    const snapshot = (await readState()).last
    if (snapshot === null) return reply(res, 409, { error: 'nothing-to-undo' })
    const outcome = await enqueue(async () => {
      const before = (await selection()).selected
      const result = await switchTo(snapshot.bundles)
      if (result.blocked.length > 0) {
        return { error: 'unappliable', blocked: result.blocked, plan: result.plan }
      }
      // Keep the previous snapshot until this undo lands, then offer a redo.
      if (result.steps.some(step => step.changed)) {
        await mutateLocked(state => {
          state.last = { name: 'redo', bundles: before, note: '', savedAt: new Date().toISOString() }
          // The running selection no longer came from a preset name.
          delete state.applied
          return { result: null }
        })
      }
      return { applied: 'undo', ...result }
    })
    reply(res, 200, outcome)
  })

  route('/delete', async (req, res) => {
    if (req.method !== 'POST') return reply(res, 405, { error: 'post-only' })
    const body = await readBody(req)
    const name = normalizePresetName(body.name)
    if (name === undefined) return reply(res, 400, { error: 'invalid-name' })
    const removed = await mutateState(state => {
      const before = state.presets.length
      state.presets = state.presets.filter(item => item.name !== name)
      const changed = state.presets.length !== before
      return { result: changed, write: changed }
    })
    reply(res, removed ? 200 : 404, { removed })
  })
}
