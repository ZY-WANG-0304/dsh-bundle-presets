/**
 * Unit checks for the pure planning half. Run with:
 *   node tests/plan.test.mjs
 */
import assert from 'node:assert/strict'
import { normalizePresetName, normalizeTarget, planChanges, planSwitch } from '../plan.js'

const known = ['@deepseek-ai/dsh-base', '@deepseek-ai/dsh-web-app', 'dshmarket', 'dsh-pet']

// A preset that drops one bundle and adds another.
assert.deepEqual(
  planChanges(['@deepseek-ai/dsh-base', '@deepseek-ai/dsh-web-app', 'dshmarket'], ['@deepseek-ai/dsh-base', '@deepseek-ai/dsh-web-app', 'dsh-pet'], known),
  { enable: ['dsh-pet'], disable: ['dshmarket'], unknown: [], kept: ['@deepseek-ai/dsh-base', '@deepseek-ai/dsh-web-app'] },
)

// Unknown names are reported, never planned.
assert.deepEqual(
  planChanges(['a'], ['a', 'ghost'], ['a', 'b']),
  { enable: [], disable: [], unknown: ['ghost'], kept: ['a'] },
)

// Duplicates in the stored list collapse.
assert.deepEqual(planChanges(['a'], ['b', 'b'], ['a', 'b']).enable, ['b'])

// No change means no calls.
assert.deepEqual(planChanges(['a', 'b'], ['b', 'a'], ['a', 'b']), { enable: [], disable: [], unknown: [], kept: ['a', 'b'] })

// Names: trimmed, bounded, and free of path separators.
assert.equal(normalizePresetName('  写作套装 '), '写作套装')
assert.equal(normalizePresetName('writing-2'), 'writing-2')
assert.equal(normalizePresetName(''), undefined)
assert.equal(normalizePresetName('   '), undefined)
assert.equal(normalizePresetName('../escape'), undefined)
assert.equal(normalizePresetName('a/b'), undefined)
assert.equal(normalizePresetName('x'.repeat(41)), undefined)
assert.equal(normalizePresetName(42), undefined)

// --- planSwitch: self protection, preflight refusals -----------------------
const bundle = (name, extra = {}) => ({ name, availability: 'profile', readOnlyReason: null, ...extra })
const catalog = [
  bundle('@deepseek-ai/dsh-base', { availability: 'installation', readOnlyReason: 'management-required' }),
  bundle('@deepseek-ai/dsh-web-app', { availability: 'installation', readOnlyReason: 'management-required' }),
  bundle('dsh-bundle-presets'),
  bundle('dsh-pet'),
  bundle('dshmarket', { availability: 'missing' }),
  bundle('broken', { error: { code: 'invalid-patch' } }),
]

// A saved list without this plugin still keeps it: the tab must not unload itself.
{
  const { plan, blocked } = planSwitch(['@deepseek-ai/dsh-base', 'dsh-bundle-presets', 'dsh-pet'], ['@deepseek-ai/dsh-base'], catalog)
  assert.deepEqual(plan.disable, ['dsh-pet'])
  assert.deepEqual(blocked, [])
}

// Turning off a protected bundle is refused before anything runs.
{
  const { blocked } = planSwitch(['@deepseek-ai/dsh-base', 'dsh-bundle-presets'], ['dsh-bundle-presets'], catalog)
  assert.deepEqual(blocked, [{ name: '@deepseek-ai/dsh-base', reason: 'management-required' }])
}

// Enabling a bundle whose files are missing, or whose patch cannot be read, is refused.
{
  const { blocked } = planSwitch(['@deepseek-ai/dsh-base', 'dsh-bundle-presets'], ['@deepseek-ai/dsh-base', 'dshmarket', 'broken'], catalog)
  assert.deepEqual(blocked, [
    { name: 'dshmarket', reason: 'unavailable' },
    { name: 'broken', reason: 'invalid-patch' },
  ])
}

// normalizeTarget appends the plugin and de-duplicates.
assert.deepEqual(normalizeTarget(['a', 'a'], new Set(['a', 'dsh-bundle-presets'])), ['a', 'dsh-bundle-presets'])
assert.deepEqual(normalizeTarget(['a'], new Set(['a'])), ['a'])

console.log('plan.test.mjs: all assertions passed')
