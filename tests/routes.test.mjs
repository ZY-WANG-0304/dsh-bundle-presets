/**
 * Route-level tests: real HTTP against the real handlers, with a stub plugin
 * manager. This is the layer that catches queue/lock mistakes — a deadlock in
 * `enqueue` only shows up when a route actually switches a bundle.
 *
 *   node tests/routes.test.mjs
 */
import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { createServer, request as httpRequest } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { apply } from '../index.js'

const dir = await mkdtemp(join(tmpdir(), 'dbp-routes-'))

/** A profile whose bundles can be switched by the stub manager. */
const makeBundles = () => ([
  { name: '@deepseek-ai/dsh-base', enabled: true, availability: 'installation', official: true, removable: false, readOnlyReason: 'management-required' },
  { name: '@deepseek-ai/dsh-web-app', enabled: true, availability: 'installation', official: true, removable: false, readOnlyReason: 'management-required' },
  { name: 'dsh-bundle-presets', enabled: true, availability: 'profile', official: false, removable: true, readOnlyReason: null },
  { name: 'alpha', enabled: true, availability: 'profile', official: false, removable: true, readOnlyReason: null },
  { name: 'beta', enabled: false, availability: 'profile', official: false, removable: true, readOnlyReason: null },
  { name: 'gamma', enabled: false, availability: 'profile', official: false, removable: true, readOnlyReason: null },
  { name: 'missing-files', enabled: false, availability: 'missing', official: false, removable: true, readOnlyReason: null },
])

let bundles = makeBundles()
const calls = []
/** name -> enabled value that should come back as a failed-but-changed step. */
let failWhen = new Map()
/** name -> enabled value whose REVERT should fail too. */
let failRevertWhen = new Map()

const manager = {
  async listBundles() {
    return bundles.map(bundle => ({ ...bundle }))
  },
  async setBundleEnabled(name, enabled) {
    calls.push([name, enabled])
    const bundle = bundles.find(item => item.name === name)
    if (bundle === undefined) return { application: 'failed', changed: false, error: { code: 'unknown' } }
    if (failWhen.get(name) === enabled) {
      // The manager wrote the manifest, then the recomposition failed.
      bundle.enabled = enabled
      return { application: 'failed', changed: true, error: { code: 'recompose-failed' } }
    }
    if (failRevertWhen.get(name) === enabled) {
      return { application: 'failed', changed: false, error: { code: 'revert-failed' } }
    }
    bundle.enabled = enabled
    return { application: 'applied', changed: true }
  },
}

const routes = new Map()
const ctx = {
  get: key => ({
    profileContext: { name: 'test-profile', dir },
    pluginManager: manager,
    webServer: {
      register: route => {
        routes.set(route.path, route.handler)
        return () => routes.delete(route.path)
      },
    },
  })[key],
  effect: fn => {
    const disposer = fn()
    return disposer
  },
}
apply(ctx)

const server = createServer((req, res) => {
  const { pathname } = new URL(req.url ?? '/', 'http://loopback')
  const handler = routes.get(pathname)
  if (handler === undefined) {
    res.writeHead(404).end()
    return
  }
  handler(req, res)
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const port = server.address().port
const base = `http://127.0.0.1:${port}/api/bundle-presets`

const post = (path, body) =>
  fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  })

/** Fail the test instead of hanging forever on a deadlocked queue. */
const within = async (promise, ms = 3000) => {
  let timer
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`timed out after ${ms}ms`)), ms)
  })
  try {
    return await Promise.race([promise, timeout])
  } finally {
    clearTimeout(timer)
  }
}

const state = async () => (await fetch(`${base}/state`)).json()

const reset = () => {
  bundles = makeBundles()
  calls.length = 0
  failWhen = new Map()
  failRevertWhen = new Map()
}

// ---------------------------------------------------------------------------
// B1 regression: a switch that changes anything must answer, write the undo
// snapshot, and leave the write queue usable.
{
  reset()
  await rm(join(dir, 'bundle-presets.json'), { force: true })
  const saved = await post('/save', { name: 'alpha-on' })
  assert.equal(saved.status, 200)

  // alpha off by hand, so applying the preset really enables something.
  bundles.find(bundle => bundle.name === 'alpha').enabled = false

  const applied = await within(post('/apply', { name: 'alpha-on' }))
  assert.equal(applied.status, 200)
  const payload = await applied.json()
  assert.equal(payload.steps.length, 1)
  assert.deepEqual(payload.steps[0].name, 'alpha')
  assert.equal(payload.steps[0].enabled, true)

  const after = await within(state())
  assert.deepEqual(after.selected.sort(), ['@deepseek-ai/dsh-base', '@deepseek-ai/dsh-web-app', 'alpha', 'dsh-bundle-presets'].sort())
  assert.notEqual(after.last, null, 'a real switch must leave an undo snapshot')

  // The queue must still settle: this is what the nested-serialize deadlock broke.
  const second = await within(post('/save', { name: 'still-alive' }))
  assert.equal(second.status, 200)
}

// ---------------------------------------------------------------------------
// A failed step that already wrote the manifest is reverted.
{
  reset()
  await rm(join(dir, 'bundle-presets.json'), { force: true })
  // Save the preset while both bundles are on, then turn them off so applying
  // it has work to do.
  bundles.find(bundle => bundle.name === 'beta').enabled = true
  bundles.find(bundle => bundle.name === 'gamma').enabled = true
  await post('/save', { name: 'wants-beta-and-gamma' })
  bundles.find(bundle => bundle.name === 'beta').enabled = false
  bundles.find(bundle => bundle.name === 'gamma').enabled = false
  const preset = (await state()).presets.find(item => item.name === 'wants-beta-and-gamma')
  assert.ok(preset.bundles.includes('beta'), 'beta was on when saved')

  failWhen = new Map([['beta', true]])
  const response = await within(post('/apply', { name: 'wants-beta-and-gamma' }))
  assert.equal(response.status, 200)
  const payload = await response.json()
  const failed = payload.steps.find(step => step.application === 'failed')
  assert.ok(failed !== undefined, 'expected a failed step')
  assert.equal(failed.changed, true)
  assert.ok(payload.steps.some(step => step.rollback === true), 'expected a rollback step')
  assert.ok(calls.some(([name, enabled]) => name === 'beta' && enabled === false), 'expected the reverse call')
  assert.equal(payload.revertFailed, false)
}

// ---------------------------------------------------------------------------
// A revert that itself fails is reported, not hidden.
{
  reset()
  await rm(join(dir, 'bundle-presets.json'), { force: true })
  bundles.find(bundle => bundle.name === 'beta').enabled = true
  await post('/save', { name: 'revert-breaks' })
  bundles.find(bundle => bundle.name === 'beta').enabled = false
  failWhen = new Map([['beta', true]])
  failRevertWhen = new Map([['beta', false]])
  const payload = await (await within(post('/apply', { name: 'revert-breaks' }))).json()
  assert.equal(payload.revertFailed, true)
  assert.equal(payload.rolledBack, false)
}

// ---------------------------------------------------------------------------
// Preflight refuses before touching anything.
{
  reset()
  await rm(join(dir, 'bundle-presets.json'), { force: true })
  const saved = await (await post('/save', { name: 'drops-base' })).json()
  assert.equal(saved.saved.name, 'drops-base')

  // Rewrite the preset so it genuinely omits base, then look before leaping.
  const updated = await post('/update', { name: 'drops-base', bundles: ['dsh-bundle-presets', 'alpha'] })
  assert.equal(updated.status, 200)
  const preview = await (await fetch(`${base}/preview?name=drops-base`)).json()
  assert.ok(preview.blocked.some(item => item.name === '@deepseek-ai/dsh-base'), 'preview must name the protected bundle')

  const before = calls.length
  const applied = await post('/apply', { name: 'drops-base' })
  assert.equal(applied.status, 200)
  const payload = await applied.json()
  assert.equal(payload.error, 'unappliable')
  assert.ok(payload.blocked.some(item => item.name === '@deepseek-ai/dsh-base'))
  assert.equal(calls.length, before, 'a refused switch must not call the manager')
}

// ---------------------------------------------------------------------------
// The fence refuses DNS rebinding.
{
  reset()
  const status = await new Promise((resolve, reject) => {
    const req = httpRequest({ host: '127.0.0.1', port, path: '/api/bundle-presets/state', headers: { host: 'evil.example' } }, res => {
      res.resume()
      resolve(res.statusCode)
    })
    req.on('error', reject)
    req.end()
  })
  assert.equal(status, 403)
}

// ---------------------------------------------------------------------------
// A damaged state file recovers instead of 500.
{
  reset()
  await writeFile(join(dir, 'bundle-presets.json'), '{ broken')
  const response = await fetch(`${base}/state`)
  assert.equal(response.status, 200)
  const payload = await response.json()
  assert.deepEqual(payload.presets, [])
  assert.equal(typeof payload.recoveredPath, 'string')
}

// ---------------------------------------------------------------------------
// Concurrent saves all land (in-process queue + file lock).
{
  reset()
  await rm(join(dir, 'bundle-presets.json'), { force: true })
  const names = Array.from({ length: 8 }, (_, index) => `concurrent-${index}`)
  const responses = await within(Promise.all(names.map(name => post('/save', { name }))))
  assert.deepEqual(responses.map(response => response.status), names.map(() => 200))
  const payload = await state()
  const stored = payload.presets.map(item => item.name)
  for (const name of names) assert.ok(stored.includes(name), `missing ${name}`)
}

// ---------------------------------------------------------------------------
// Name conflict needs an explicit overwrite.
{
  reset()
  await rm(join(dir, 'bundle-presets.json'), { force: true })
  assert.equal((await post('/save', { name: 'dup' })).status, 200)
  assert.equal((await post('/save', { name: 'dup' })).status, 409)
  assert.equal((await post('/save', { name: 'dup', overwrite: true })).status, 200)
  assert.equal((await post('/update', { name: 'nope', bundles: [] })).status, 404)
}

// ---------------------------------------------------------------------------
// A stale lock is taken over; a fresh one makes the write wait and report busy.
{
  reset()
  await rm(join(dir, 'bundle-presets.json'), { force: true })
  const lockPath = join(dir, 'bundle-presets.json.lock')
  await writeFile(lockPath, JSON.stringify({ pid: 999999, at: 1, nonce: 'stale' }))
  const taken = await within(post('/save', { name: 'after-stale' }))
  assert.equal(taken.status, 200, 'a stale lock must be taken over')
  assert.equal(await readFile(lockPath).catch(() => undefined), undefined, 'the lock must be released')

  await writeFile(lockPath, JSON.stringify({ pid: process.pid, at: Date.now(), nonce: 'fresh' }))
  const busy = await within(post('/save', { name: 'blocked-by-lock' }), 6000)
  assert.equal(busy.status, 503, 'a live lock must not be stolen')
  await rm(lockPath, { force: true })
}

server.close()
await rm(dir, { recursive: true, force: true })
console.log('routes.test.mjs: all assertions passed')
