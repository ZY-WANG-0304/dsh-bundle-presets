/**
 * Pure planning for one preset switch: never touches DSH state, so it can be
 * tested without a running profile.
 *
 * The order matters when the caller executes it: enable first, then disable.
 * That keeps the browser bundle (`@deepseek-ai/dsh-web-app`) alive while a
 * preset that swaps UI-heavy bundles is applied, instead of dropping the page
 * for the moment between the two calls.
 */

/** The bundle that carries this plugin: a switch never turns it off. */
export const SELF_BUNDLE = 'dsh-bundle-presets'

/**
 * @param {readonly string[]} current bundle names selected now, in manifest order
 * @param {readonly string[]} target bundle names the preset wants
 * @param {Iterable<string>} known bundle names this profile can select
 * @returns {{ enable: string[], disable: string[], unknown: string[], kept: string[] }}
 */
export function planChanges(current, target, known) {
  const knownSet = known instanceof Set ? known : new Set(known)
  const wanted = [...new Set(target)].filter(name => knownSet.has(name))
  const unknown = [...new Set(target)].filter(name => !knownSet.has(name))
  const currentSet = new Set(current)
  const wantedSet = new Set(wanted)
  return {
    enable: wanted.filter(name => !currentSet.has(name)),
    disable: current.filter(name => !wantedSet.has(name)),
    unknown,
    kept: current.filter(name => wantedSet.has(name)),
  }
}

/**
 * Validate a user-supplied preset name. The stored name is only a label, but
 * it is echoed into the UI and used as a key, so keep it short and printable.
 * @param {unknown} value
 * @returns {string | undefined} the trimmed name, or undefined when unusable
 */
export function normalizePresetName(value) {
  if (typeof value !== 'string') return undefined
  const name = value.trim()
  if (name.length === 0 || name.length > 40) return undefined
  if (!/^[\p{L}\p{N}][\p{L}\p{N} ._+-]*$/u.test(name)) return undefined
  return name
}

/**
 * Add this plugin's own bundle to a saved list, so applying the list can never
 * unload the tab that drives the switch.
 * @param {readonly string[]} target
 * @param {Iterable<string>} known
 * @returns {string[]}
 */
export function normalizeTarget(target, known) {
  const knownSet = known instanceof Set ? known : new Set(known)
  const list = [...new Set(target.filter(item => typeof item === 'string'))]
  if (knownSet.has(SELF_BUNDLE) && !list.includes(SELF_BUNDLE)) list.push(SELF_BUNDLE)
  return list
}

/**
 * Plan one switch and refuse the ones that cannot run to completion.
 *
 * A switch is all-or-nothing on the planning side: if any bundle cannot be
 * turned on (missing files, unreadable patch) or off (the plugin manager
 * protects it), the caller must not start, because a half-applied switch is
 * what leaves a profile holding a bundle it cannot load.
 *
 * @param {readonly string[]} current selected bundle names, in manifest order
 * @param {readonly string[]} target bundle names the preset wants
 * @param {ReadonlyArray<{ name: string, availability?: string, readOnlyReason?: string, error?: { code?: string } }>} bundles
 * @returns {{ plan: { enable: string[], disable: string[], unknown: string[], kept: string[] }, blocked: Array<{ name: string, reason: string }> }}
 */
export function planSwitch(current, target, bundles) {
  const known = new Set(bundles.map(bundle => bundle.name))
  const plan = planChanges(current, normalizeTarget(target, known), known)
  plan.disable = plan.disable.filter(item => item !== SELF_BUNDLE)
  const index = new Map(bundles.map(bundle => [bundle.name, bundle]))
  const blocked = []
  for (const name of plan.enable) {
    const bundle = index.get(name)
    if (bundle === undefined) {
      blocked.push({ name, reason: 'unknown' })
      continue
    }
    if (bundle.availability !== 'installation' && bundle.availability !== 'profile') {
      blocked.push({ name, reason: 'unavailable' })
      continue
    }
    if (bundle.error !== undefined && bundle.error !== null) blocked.push({ name, reason: bundle.error?.code ?? 'error' })
  }
  for (const name of plan.disable) {
    const bundle = index.get(name)
    if (bundle?.readOnlyReason !== undefined && bundle?.readOnlyReason !== null) {
      blocked.push({ name, reason: bundle.readOnlyReason })
    }
  }
  return { plan, blocked }
}
