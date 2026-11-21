/**
 * dsh-bundle-presets — browser half.
 *
 * A tab on the Plugins page built from the app's own design tokens: the same
 * row anatomy (48px icon frame, 14/20 title, 13/18 description), the native
 * 36×20 switch, and the native button scale. Presets can be edited in place by
 * flipping switches; only applying touches the running profile.
 */
window.__ModuleLoader__.load({
  id: 'dsh-bundle-presets',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const DICTIONARY = {
      zh: {
        tab: '组合预设',
        current: '当前组合',
        saved: '已保存的预设',
        hint: '切换由插件管理器执行：受保护的核心 bundle 不会被关闭，写清单的锁与兼容性校验也由它负责。',
        viewList: '查看列表',
        collapseList: '收起列表',
        readonlyHint: '只读：这里显示当前生效的组合（按层叠顺序）。要增删，请编辑下方预设，或到「已安装」标签页操作。',
        unappliable: '有 bundle 无法变更',
        reasonUnavailable: '未安装',
        reasonUnknown: '不在本 profile',
        reasonProtected: '受保护',
        errInvalidName: '名称不合法：1–40 个字符，不能包含路径分隔符',
        errUnknownPreset: '这套预设不存在了，可能已被删除',
        errNothingToUndo: '没有可撤销的记录',
        errBusy: '预设文件正被另一个 DSH 进程占用，稍后再试',
        errUntrusted: '请求未通过本机校验',
        errTimeout: '请求超时，Host 没有响应',
        recovered: '预设文件已损坏，已备份并重置',
        count: '{n} 个 bundle',
        namePlaceholder: '预设名称，例如 写作套装',
        notePlaceholder: '备注（可选）',
        save: '存为预设',
        edit: '编辑',
        collapse: '收起',
        apply: '套用',
        preview: '检查差异',
        remove: '删除',
        undo: '撤销上次切换',
        refresh: '刷新',
        empty: '还没有预设。把当前组合命名后存下来，就会出现在这里。',
        matched: '当前',
        savedAt: '保存于',
        noUndo: '没有可撤销的记录',
        busySaving: '保存中…',
        busyApplying: '切换中…',
        busyPreview: '检查中…',
        busyUndo: '撤销中…',
        savedNotice: '已保存',
        nameExists: '已有同名预设「{name}」',
        overwriteAsk: '「{name}」已存在，覆盖原预设？',
        overwrite: '覆盖',
        done: '已切换',
        failed: '失败',
        skipped: '本 profile 没有',
        restart: '需要重启',
        noop: '组合没有变化',
        filter: '筛选 bundle',
        selectedCount: '已选 {n} / {total}',
        saveEdits: '保存修改',
        cancel: '取消',
        resetToCurrent: '恢复成当前组合',
        clearAll: '全部关闭',
        protectedHint: '受保护',
        missing: '已不在本 profile',
        orderHint: '顺序即层叠顺序：新打开的追加到末尾',
        more: '… 还有 {n} 个',
        switcher: '插件组合预设',
        switcherNone: '未匹配',
        switcherEmpty: '还没有预设，到「插件 › 组合预设」里存一个',
        switcherLoading: '加载中…',
        manage: '管理预设…',
      },
      en: {
        tab: 'Presets',
        current: 'Current set',
        saved: 'Saved presets',
        hint: 'The plugin manager performs the switch: protected core bundles are never turned off, and it owns the manifest lock and compatibility checks.',
        viewList: 'Show list',
        collapseList: 'Hide list',
        readonlyHint: 'Read-only: the active set in layer order. Edit a preset below, or use the Installed tab, to change it.',
        unappliable: 'Some bundles cannot be changed',
        reasonUnavailable: 'not installed',
        reasonUnknown: 'not in this profile',
        reasonProtected: 'protected',
        errInvalidName: 'Invalid name: 1–40 characters, no path separators',
        errUnknownPreset: 'That preset no longer exists',
        errNothingToUndo: 'Nothing to undo',
        errBusy: 'Another DSH process is writing the preset file; try again',
        errUntrusted: 'The request failed the local trust check',
        errTimeout: 'Request timed out; the host did not answer',
        recovered: 'The preset file was damaged; it was backed up and reset',
        count: '{n} bundles',
        namePlaceholder: 'Preset name, e.g. writing',
        notePlaceholder: 'Note (optional)',
        save: 'Save preset',
        edit: 'Edit',
        collapse: 'Collapse',
        apply: 'Apply',
        preview: 'Preview',
        remove: 'Delete',
        undo: 'Undo last switch',
        refresh: 'Refresh',
        empty: 'No presets yet. Name the current set above and it appears here.',
        matched: 'current',
        savedAt: 'Saved',
        noUndo: 'Nothing to undo',
        busySaving: 'Saving…',
        busyApplying: 'Switching…',
        busyPreview: 'Checking…',
        busyUndo: 'Undoing…',
        savedNotice: 'Saved',
        nameExists: 'A preset named "{name}" already exists',
        overwriteAsk: 'Overwrite the existing "{name}"?',
        overwrite: 'Overwrite',
        done: 'Switched to',
        failed: 'failed',
        skipped: 'missing here',
        restart: 'restart required',
        noop: 'Selection unchanged',
        filter: 'Filter bundles',
        selectedCount: '{n} of {total} selected',
        saveEdits: 'Save changes',
        cancel: 'Cancel',
        resetToCurrent: 'Reset to current set',
        clearAll: 'Turn all off',
        protectedHint: 'protected',
        missing: 'No longer in this profile',
        orderHint: 'Order is layer order: newly enabled bundles append at the end',
        more: '… {n} more',
        switcher: 'Presets',
        switcherNone: 'No match',
        switcherEmpty: 'No presets yet — save one on Plugins › Presets',
        switcherLoading: 'Loading…',
        manage: 'Manage presets…',
      },
    }

    const NS = 'dshBundlePresets'
    const language = String((typeof navigator !== 'undefined' && navigator.language) || 'en').toLowerCase()
    const fallbackT = key => DICTIONARY[language.startsWith('zh') ? 'zh' : 'en'][key] ?? key

    /** `{name}` placeholders, so the dictionaries stay plain strings. */
    const format = (tfn, key, vars) => {
      const template = String(tfn(key) ?? key)
      if (vars === undefined) return template
      return template.replace(/\{(\w+)\}/g, (match, name) => (vars[name] === undefined ? match : String(vars[name])))
    }

    /** LocalizedText fallback for hosts without the locale service. */
    const text = value => {
      if (typeof value === 'string') return value
      if (value === null || typeof value !== 'object') return ''
      const lang = language.split('-')[0]
      return value[language] ?? value[lang] ?? value.en ?? Object.values(value)[0] ?? ''
    }

    const shortName = name => String(name).replace('@deepseek-ai/', '').replace('@', '')

    const reasonLabel = (tv, reason) => {
      if (reason === 'unavailable') return tv('reasonUnavailable')
      if (reason === 'unknown') return tv('reasonUnknown')
      if (reason === 'management-required') return tv('reasonProtected')
      return reason ?? '?'
    }

    const describeBlocked = (tv, blocked) =>
      (Array.isArray(blocked) ? blocked : [])
        .map(item => `${shortName(item.name)} (${reasonLabel(tv, item.reason)})`)
        .join(' , ')
    /** Set equality: the manager appends newly enabled bundles, so order cannot be compared. */
    const sameSet = (a, b) => a.length === b.length && a.every(item => b.includes(item))

    /**
     * The preset name the Host recorded for this selection. Falls back to the
     * undo snapshot's `before <name>`, which older state files only carry.
     * @param data `/state` payload, or undefined before the first load
     * @returns the applied preset name, or null
     */
    const appliedPresetName = data => {
      if (typeof data?.applied === 'string') return data.applied
      const name = data?.last?.name
      return typeof name === 'string' && name.startsWith('before ') ? name.slice('before '.length) : null
    }

    /**
     * Which preset the running selection is, ignoring bundles this profile can no
     * longer select: a preset saved before a bundle was removed still names it,
     * and applying it silently skips that name — so compare what would apply.
     * @param presets saved presets, any order
     * @param selected bundle names enabled now
     * @param bundles the profile's bundle rows from `/state` (undefined before the first load)
     * @returns the matching preset, or null
     */
    const matchPreset = (presets, selected, bundles, preferred) => {
      const list = Array.isArray(presets) ? presets : []
      const known = Array.isArray(bundles) ? new Set(bundles.map(bundle => bundle.name)) : null
      const matches = list.filter(preset => {
        const target = Array.isArray(preset?.bundles) ? preset.bundles : []
        return sameSet(selected, known === null ? target : target.filter(name => known.has(name)))
      })
      if (matches.length === 0) return null
      // Two presets can reduce to the same applicable bundles; name the one the
      // user actually applied.
      if (typeof preferred === 'string') {
        const applied = matches.find(preset => preset.name === preferred)
        if (applied !== undefined) return applied
      }
      return matches[0]
    }

    const STYLE_ID = 'dsh-bundle-presets-style'
    const CSS = `
.dbp-page { display: flex; flex-direction: column; gap: 32px; color: var(--dsw-alias-label-primary); }
.dbp-group { display: flex; flex-direction: column; gap: 8px; }
.dbp-group-head { display: flex; align-items: center; gap: 8px; min-height: 24px; }
.dbp-group-title { flex: 1; margin: 0; font-size: 14px; line-height: 22px; font-weight: 500; }
.dbp-hint { margin: 0; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-tertiary); }
.dbp-notice { margin: 0; font-size: 12px; line-height: 18px; color: var(--dsw-alias-state-business-primary); }
.dbp-error { margin: 0; font-size: 12px; line-height: 18px; color: var(--dsw-alias-state-error-primary); }
.dbp-card { margin: 0 -8px; padding: 8px; border-radius: var(--dsw-radius-xl); }
.dbp-card-head { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.dbp-icon { display: inline-flex; flex: none; align-items: center; justify-content: center; width: 48px; height: 48px; overflow: hidden; border: var(--dsh-hairline-width, .5px) solid var(--dsw-alias-border-l3); border-radius: var(--dsw-radius-lg); color: var(--dsw-alias-label-secondary); }
.dbp-icon > img { width: 30px; height: 30px; object-fit: contain; }
.dbp-main { flex: 1 1 220px; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.dbp-title { display: flex; align-items: center; gap: 8px; font-size: 14px; line-height: 20px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dbp-desc { font-size: 13px; line-height: 18px; color: var(--dsw-alias-label-tertiary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dbp-members { font-size: 12px; line-height: 16px; color: var(--dsw-alias-label-tertiary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dbp-badge { flex: none; height: 18px; padding: 0 7px; display: inline-flex; align-items: center; border-radius: var(--dsw-radius-xs); font-size: 10px; line-height: 1; font-weight: 400; color: var(--dsw-alias-brand-primary); background: color-mix(in srgb, var(--dsw-alias-brand-primary) 12%, transparent); }
.dbp-end { display: inline-flex; align-items: center; gap: 8px; flex: none; }
.dbp-btn { box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; gap: 4px; height: 28px; padding: 0 10px; border: 0; border-radius: var(--dsw-radius-sm); font-size: 12px; line-height: 18px; font-weight: 400; color: var(--dsw-alias-label-primary); background: transparent; cursor: pointer; white-space: nowrap; }
.dbp-btn:disabled { opacity: .4; cursor: not-allowed; }
.dbp-btn:focus-visible { outline: var(--dsw-focus-ring-width, 2px) solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary)); outline-offset: 1px; }
.dbp-btn[data-variant='ghost']:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover); }
.dbp-btn[data-variant='ghost']:active:not(:disabled) { background: var(--dsw-alias-interactive-bg-active); }
.dbp-btn[data-variant='primary'] { color: var(--dsw-alias-label-primary-foreground); background: var(--dsw-alias-button-primary-fill); }
.dbp-btn[data-variant='primary']:hover:not(:disabled) { background: var(--dsw-alias-button-primary-hover); }
.dbp-btn[data-variant='outline'] { box-shadow: inset 0 0 0 var(--dsh-hairline-width, .5px) var(--dsw-alias-border-l3); }
.dbp-btn[data-variant='outline']:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover); }
.dbp-btn[data-variant='danger'] { color: var(--dsw-alias-state-error-primary); box-shadow: inset 0 0 0 var(--dsh-hairline-width, .5px) color-mix(in srgb, var(--dsw-alias-state-error-primary) 30%, transparent); }
.dbp-btn[data-variant='danger']:hover:not(:disabled) { background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 8%, transparent); }
.dbp-input { box-sizing: border-box; height: 28px; min-width: 0; padding: 0 10px; border: 0; border-radius: var(--dsw-radius-sm); font-size: 12px; line-height: 18px; font-family: inherit; color: var(--dsw-alias-label-primary); background: transparent; box-shadow: inset 0 0 0 var(--dsh-hairline-width, .5px) var(--dsw-alias-border-l3); }
.dbp-input::placeholder { color: var(--dsw-alias-label-tertiary); }
.dbp-input:focus-visible { outline: var(--dsw-focus-ring-width, 2px) solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary)); outline-offset: 1px; }
.dbp-input[data-grow] { flex: 1 1 160px; }
.dbp-editor { display: flex; flex-direction: column; gap: 12px; padding: 12px 8px 8px calc(8px + 48px + 14px); }
.dbp-toolbar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.dbp-rows { display: flex; flex-direction: column; max-height: 384px; overflow-y: auto; overscroll-behavior: contain; border-radius: var(--dsw-radius-md); box-shadow: inset 0 0 0 var(--dsh-hairline-width, .5px) var(--dsw-alias-border-l3); }
.dbp-rows::-webkit-scrollbar { width: 6px; }
.dbp-rows::-webkit-scrollbar-thumb { border-radius: 999px; background: var(--dsw-alias-scrollbar-bg-l2); }
.dbp-row { display: flex; align-items: center; gap: 12px; padding: 8px 12px; }
.dbp-row + .dbp-row { border-top: var(--dsh-hairline-width, .5px) solid var(--dsw-alias-border-l3); }
.dbp-row:hover { background: var(--dsw-alias-interactive-bg-hover); }
.dbp-row--static:hover { background: transparent; }
.dbp-row-icon { display: inline-flex; flex: none; align-items: center; justify-content: center; width: 32px; height: 32px; overflow: hidden; border: var(--dsh-hairline-width, .5px) solid var(--dsw-alias-border-l3); border-radius: var(--dsw-radius-sm); color: var(--dsw-alias-label-tertiary); font-size: 12px; }
.dbp-row-icon > img { width: 22px; height: 22px; object-fit: contain; }
.dbp-row-main { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.dbp-row-line { display: flex; align-items: baseline; gap: 8px; min-width: 0; }
.dbp-row-title { font-size: 13px; line-height: 18px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dbp-row-id { font-size: 11px; line-height: 16px; font-family: var(--dsh-font-family-code, ui-monospace, SFMono-Regular, Menlo, monospace); color: var(--dsw-alias-label-tertiary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dbp-row-desc { font-size: 12px; line-height: 16px; color: var(--dsw-alias-label-tertiary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dbp-row-note { flex: none; font-size: 11px; line-height: 16px; color: var(--dsw-alias-label-tertiary); }
.dbp-switch { box-sizing: border-box; position: relative; flex: 0 0 auto; width: 36px; height: 20px; padding: 2px; border: 0; border-radius: 999px; background: var(--dsw-alias-border-l3); cursor: pointer; }
.dbp-switch[aria-checked='true'] { background: var(--dsw-alias-brand-primary); }
.dbp-switch:disabled { opacity: .5; cursor: default; }
.dbp-switch:focus-visible { outline: var(--dsw-focus-ring-width, 2px) solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary)); outline-offset: 2px; }
.dbp-thumb { display: block; width: 16px; height: 16px; border-radius: 50%; background: var(--dsw-alias-label-primary-foreground); transition: transform .12s ease; }
.dbp-switch[aria-checked='false'] .dbp-thumb { background: var(--dsw-alias-switch-thumb); }
.dbp-switch[aria-checked='true'] .dbp-thumb { background: var(--dsw-alias-label-primary-foreground); transform: translate(16px); }
.dbp-stack { display: flex; flex-direction: column; gap: 2px; }
`

    /** One design-system button. `variant` is ghost (default), primary, outline, or danger. */
    function Btn({ variant = 'ghost', children, ...rest }) {
      return h('button', {
        type: 'button',
        className: 'dbp-btn',
        'data-variant': variant,
        ...rest,
      }, children)
    }

    function Switch({ on, onChange, disabled, label }) {
      return h('button', {
        type: 'button',
        role: 'switch',
        className: 'dbp-switch',
        'aria-checked': on,
        'aria-label': label,
        disabled,
        onClick: onChange,
      }, h('span', { className: 'dbp-thumb' }))
    }

    /** A stack-of-layers glyph for the current set and for presets without an icon. */
    function StackIcon({ size = 24 }) {
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.5,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true,
      },
        h('path', { d: 'M12 3.5 20.5 8 12 12.5 3.5 8 12 3.5Z' }),
        h('path', { d: 'M3.5 12 12 16.5 20.5 12' }),
        h('path', { d: 'M3.5 16 12 20.5 20.5 16' }),
      )
    }

    /** The plugin's own mark — icon.svg, inlined so the sidebar row needs no asset request. */
    function PluginMark({ size = 16 }) {
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 16 16',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.5,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true,
      },
        h('rect', { x: 2.2, y: 2.6, width: 6.4, height: 2.8, rx: 0.9 }),
        h('rect', { x: 2.2, y: 6.6, width: 9.8, height: 2.8, rx: 0.9 }),
        h('rect', { x: 2.2, y: 10.6, width: 4.2, height: 2.8, rx: 0.9 }),
        h('path', { d: 'M8.9 12.1 10.4 13.6 14.2 8.7' }),
      )
    }

    const ENDPOINT = '/api/bundle-presets'

    const REQUEST_TIMEOUT_MS = 60_000

    const request = async (path, init) => {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
      let response
      try {
        response = await fetch(`${ENDPOINT}${path}`, {
          headers: { accept: 'application/json', ...(init?.body ? { 'content-type': 'application/json' } : {}) },
          signal: controller.signal,
          ...init,
        })
      } catch (error) {
        if (error?.name === 'AbortError') {
          const timeout = new Error('timeout')
          timeout.payload = { error: 'timeout' }
          throw timeout
        }
        throw error
      } finally {
        clearTimeout(timer)
      }
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        const error = new Error(payload.error ?? `HTTP ${response.status}`)
        error.payload = payload
        throw error
      }
      return payload
    }

    const time = value => {
      if (typeof value !== 'string') return ''
      const date = new Date(value)
      return Number.isNaN(date.getTime()) ? '' : date.toLocaleString()
    }

    function summary(outcome, tv) {
      if (outcome?.error !== undefined) return { kind: 'error', text: outcome.error }
      const steps = Array.isArray(outcome?.steps) ? outcome.steps : []
      const failed = steps.filter(step => step.application === 'failed')
      const pending = steps.filter(step => step.application === 'restart-required')
      if (failed.length > 0) {
        return {
          kind: 'error',
          text: `${tv('failed')}: ${failed.map(step => `${shortName(step.name)} (${step.error ?? '?'})`).join(', ')}`,
        }
      }
      if (steps.length === 0) return { kind: 'info', text: tv('noop') }
      const parts = [`${tv('done')} · ${steps.length}`]
      if (outcome.plan?.unknown?.length > 0) parts.push(`${tv('skipped')}: ${outcome.plan.unknown.map(shortName).join(', ')}`)
      if (pending.length > 0) parts.push(`${tv('restart')}: ${pending.map(step => shortName(step.name)).join(', ')}`)
      return { kind: 'info', text: parts.join(' · ') }
    }

    const SWITCHER_CSS = `
.dbp-sw { box-sizing: border-box; position: relative; display: flex; flex: 0 0 auto; width: 100%; min-width: 0; order: -1; margin: 0 0 4px 0; }
.dbp-sw[data-rail] { width: auto; }
/* The expanded row takes the sidebar's own horizontal geometry
   (dsh-client-ui-sidebar SidebarRoot.module.css, .panelRow): the column pads
   8px, the row paints a 3px transparent inset border, so the hover plate runs
   11px..269px and 9px of padding puts glyphs at 20px and labels at 42px — the
   same columns the rows above use. Hover stays on background-color and inside
   @media (hover: hover), as in the shell: the background shorthand resets
   background-clip to border-box and silently drops that inset. */
.dbp-sw-row { box-sizing: border-box; display: flex; align-items: center; gap: var(--dsh-sidebar-label-gap, 6px); width: 100%; min-height: 32px; margin: 0; padding: 5px calc(var(--dsh-sidebar-row-padding, 12px) - var(--dsh-sidebar-paint-inset, 3px)); border: 0; border-inline: var(--dsh-sidebar-paint-inset, 3px) solid transparent; border-radius: var(--dsw-radius-md); background: transparent; background-clip: padding-box; color: var(--dsw-alias-label-primary); font: inherit; font-size: 14px; line-height: 22px; text-align: left; cursor: pointer; }
.dbp-sw-row[aria-expanded='true'] { background-color: var(--dsw-alias-interactive-bg-hover); }
@media (hover: hover) {
  .dbp-sw-row:hover { background-color: var(--dsw-alias-interactive-bg-hover); }
}
.dbp-sw-row:focus-visible { outline: var(--dsw-focus-ring-width, 2px) solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary)); outline-offset: -2px; }
.dbp-sw-glyph { flex: none; display: inline-flex; align-items: center; justify-content: center; }
.dbp-sw-label { flex: none; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dbp-sw-value { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-tertiary); }
.dbp-sw[data-rail] .dbp-sw-row { width: 36px; min-height: 36px; padding: 0; border-inline: 0; justify-content: center; }
.dbp-fly { position: fixed; z-index: 40; box-sizing: border-box; display: flex; flex-direction: column; gap: 1px; width: 264px; max-width: calc(100vw - 16px); padding: 6px; overflow-y: auto; overscroll-behavior: contain; border-radius: var(--dsw-radius-lg); color: var(--dsw-alias-label-primary); background: var(--dsw-specific-menu, var(--dsw-alias-bg-layer-2)); backdrop-filter: var(--dsw-menu-backdrop-filter); box-shadow: var(--dsw-elevation-panel); font-size: 13px; line-height: 18px; }
.dbp-fly::-webkit-scrollbar { width: 6px; }
.dbp-fly::-webkit-scrollbar-thumb { border-radius: 999px; background: var(--dsw-alias-scrollbar-bg-l2); }
.dbp-fly-head { display: flex; align-items: center; gap: 8px; padding: 2px 6px 4px; }
.dbp-fly-title { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; line-height: 16px; color: var(--dsw-alias-label-tertiary); }
.dbp-fly-hint { flex: none; font-size: 11px; line-height: 16px; color: var(--dsw-alias-label-tertiary); }
.dbp-fly-item { box-sizing: border-box; display: flex; align-items: center; gap: 8px; width: 100%; height: 32px; margin: 0; padding: 0 8px; border: 0; border-radius: var(--dsw-radius-sm); background: transparent; color: var(--dsw-alias-label-primary); font: inherit; font-size: 13px; line-height: 18px; text-align: left; cursor: pointer; }
.dbp-fly-item:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover); }
.dbp-fly-item:focus-visible { outline: var(--dsw-focus-ring-width, 2px) solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary)); outline-offset: -1px; }
.dbp-fly-item:disabled { opacity: .45; cursor: default; }
.dbp-fly-check { flex: none; display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; color: var(--dsw-alias-brand-primary); }
.dbp-fly-label { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dbp-fly-trail { flex: none; font-size: 11px; line-height: 16px; color: var(--dsw-alias-label-tertiary); }
.dbp-fly-sep { flex: none; height: var(--dsh-hairline-width, .5px); margin: 4px; background: var(--dsw-alias-border-l3); }
.dbp-fly-note { padding: 4px 8px 6px; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-tertiary); }
.dbp-fly-error { color: var(--dsw-alias-state-error-primary); }
.dbp-spin { display: inline-flex; animation: dbp-spin .8s linear infinite; }
@keyframes dbp-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .dbp-spin { animation: none; } }
`

    /** Stroke glyphs for the sidebar switcher, drawn at any requested size. */
    const strokeGlyph = paths => function StrokeGlyph({ size = 14 }) {
      return h('svg', {
        width: size, height: size, viewBox: '0 0 16 16', fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round',
        'aria-hidden': true,
      }, paths.map((d, index) => h('path', { key: index, d })))
    }
    const CheckIcon = strokeGlyph(['M3.4 8.4 6.3 11.2 12.6 4.8'])
    const UndoIcon = strokeGlyph(['M5.8 3.2 2.8 6.2l3 3', 'M2.8 6.2h6.6a3.6 3.6 0 0 1 0 7.2H6.6'])
    const ManageIcon = strokeGlyph(['M2.8 5.2h10.4', 'M2.8 10.8h10.4', 'M10.4 3.4v3.6', 'M5.6 9v3.6'])

    function SpinnerIcon({ size = 14 }) {
      return h('span', { className: 'dbp-spin', 'aria-hidden': true }, h('svg', {
        width: size, height: size, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true,
      }, h('circle', {
        cx: 8, cy: 8, r: 5.6, stroke: 'currentColor', strokeWidth: 1.6,
        strokeLinecap: 'round', strokeDasharray: '10 26',
      })))
    }

    const HOVER_OPEN_MS = 140
    const HOVER_CLOSE_MS = 280

    /**
     * The sidebar's preset switcher: one footer row showing the active bundle
     * preset, and a flyout that applies another one. On fine pointers hovering
     * the row opens the flyout after a short delay and leaving both closes it;
     * a click pins it, moves focus inside, and Escape returns focus to the row.
     *
     * The flyout is `position: fixed` inside the row's own subtree (the same
     * shape the app's own footer panels use): the sidebar column clips its
     * content, and a fixed box escapes that clip without a body-level portal.
     */
    function PresetSwitcher({ wide, t: frameSeat, seat, resolve, onManage }) {
      const t = typeof frameSeat === 'function' ? frameSeat : seat
      const tv = (key, vars) => format(t, key, vars)
      const label = value => (typeof resolve === 'function' ? resolve(value) : text(value))
      const shownWide = wide !== false
      const [open, setOpen] = React.useState(false)
      const [pinned, setPinned] = React.useState(false)
      const [state, setState] = React.useState({ status: 'idle', data: null, error: null })
      const [busy, setBusy] = React.useState(null)
      const [notice, setNotice] = React.useState(null)
      const [active, setActive] = React.useState(-1)
      const [pos, setPos] = React.useState(null)
      const rootRef = React.useRef(null)
      const rowRef = React.useRef(null)
      const panelRef = React.useRef(null)
      const openRef = React.useRef(false)
      const pinnedRef = React.useRef(false)
      const timers = React.useRef({ open: 0, close: 0 })
      const alive = React.useRef(true)

      React.useEffect(() => {
        alive.current = true
        return () => { alive.current = false }
      }, [])
      React.useEffect(() => { openRef.current = open }, [open])
      React.useEffect(() => { pinnedRef.current = pinned }, [pinned])
      React.useEffect(() => () => {
        window.clearTimeout(timers.current.open)
        window.clearTimeout(timers.current.close)
      }, [])

      const load = React.useCallback(async () => {
        try {
          const data = await request('/state')
          if (!alive.current) return
          setState({ status: 'ready', data, error: null })
        } catch (error) {
          if (!alive.current) return
          setState(previous => ({
            status: previous.data === null ? 'error' : 'ready',
            data: previous.data,
            error: error?.message ?? 'error',
          }))
        }
      }, [])

      React.useEffect(() => { if (open) load() }, [open, load])

      const data = state.data
      const presets = Array.isArray(data?.presets) ? data.presets : []
      const selected = Array.isArray(data?.selected) ? data.selected : []
      const current = matchPreset(presets, selected, data?.bundles, appliedPresetName(data))
      const currentLabel = current === null ? tv('switcherNone') : current.name
      const canUndo = data !== null && data !== undefined && data.last !== null && data.last !== undefined

      const items = []
      presets.forEach(preset => {
        const bundles = Array.isArray(preset.bundles) ? preset.bundles : []
        items.push({
          id: `preset:${preset.name}`,
          kind: 'preset',
          preset,
          label: preset.name,
          current: current !== null && current.name === preset.name,
          count: bundles.length,
          disabled: busy !== null,
        })
      })
      items.push({ id: 'undo', kind: 'undo', label: t('undo'), disabled: busy !== null || !canUndo })
      items.push({ id: 'manage', kind: 'manage', label: t('manage'), disabled: busy !== null })
      const enabled = items.map((item, index) => (item.disabled ? -1 : index)).filter(index => index >= 0)
      const firstEnabled = enabled.length > 0 ? enabled[0] : -1

      const clearTimers = () => {
        window.clearTimeout(timers.current.open)
        window.clearTimeout(timers.current.close)
        timers.current.open = 0
        timers.current.close = 0
      }
      const closeNow = () => {
        clearTimers()
        setPinned(false)
        setOpen(false)
        setActive(-1)
        setNotice(null)
      }
      const openNow = (pin, focusIndex = -1) => {
        clearTimers()
        setState(previous => (previous.data === null ? { status: 'loading', data: null, error: null } : previous))
        setPinned(pin)
        setOpen(true)
        setActive(focusIndex)
      }
      const hoverFine = () => typeof window !== 'undefined'
        && typeof window.matchMedia === 'function'
        && window.matchMedia('(hover: hover) and (pointer: fine)').matches
      const armOpen = () => {
        if (!hoverFine() || openRef.current) return
        window.clearTimeout(timers.current.close)
        timers.current.close = 0
        if (timers.current.open !== 0) return
        timers.current.open = window.setTimeout(() => {
          timers.current.open = 0
          if (!openRef.current) openNow(false)
        }, HOVER_OPEN_MS)
      }
      const armClose = () => {
        window.clearTimeout(timers.current.open)
        timers.current.open = 0
        if (!openRef.current || pinnedRef.current) return
        if (timers.current.close !== 0) return
        timers.current.close = window.setTimeout(() => {
          timers.current.close = 0
          if (openRef.current && !pinnedRef.current) {
            setOpen(false)
            setActive(-1)
          }
        }, HOVER_CLOSE_MS)
      }

      React.useLayoutEffect(() => {
        if (!open) {
          setPos(null)
          return
        }
        const place = () => {
          const row = rowRef.current
          const panel = panelRef.current
          if (row === null) return
          const rect = row.getBoundingClientRect()
          const width = Math.min(264, Math.max(160, window.innerWidth - 16))
          const height = panel === null ? 240 : Math.min(panel.offsetHeight, window.innerHeight - 16)
          const left = Math.min(Math.max(8, rect.left), Math.max(8, window.innerWidth - width - 8))
          const roomAbove = rect.top - 8
          const next = roomAbove >= Math.min(height, 200)
            ? { left, width, bottom: Math.max(8, window.innerHeight - rect.top + 4), maxHeight: roomAbove, top: undefined }
            : { left, width, top: Math.min(rect.bottom + 4, Math.max(8, window.innerHeight - 8 - height)), maxHeight: window.innerHeight - rect.bottom - 12, bottom: undefined }
          setPos(previous => (previous !== null
            && previous.left === next.left
            && previous.width === next.width
            && previous.top === next.top
            && previous.bottom === next.bottom
            && previous.maxHeight === next.maxHeight
            ? previous
            : next))
        }
        place()
        window.addEventListener('resize', place)
        window.addEventListener('scroll', place, true)
        return () => {
          window.removeEventListener('resize', place)
          window.removeEventListener('scroll', place, true)
        }
      }, [open, state.status, busy, notice, data, active])

      React.useEffect(() => {
        if (!open) return
        const onPointerDown = event => {
          if (rootRef.current !== null && rootRef.current.contains(event.target)) return
          closeNow()
        }
        // Hover can open the flyout without moving focus into it, so Escape has
        // to work from anywhere while it is open.
        const onKeyDown = event => {
          if (event.key !== 'Escape') return
          event.preventDefault()
          closeNow()
          if (rowRef.current !== null && rootRef.current !== null && !rootRef.current.contains(document.activeElement)) {
            rowRef.current.focus({ preventScroll: true })
          }
        }
        document.addEventListener('pointerdown', onPointerDown, true)
        document.addEventListener('keydown', onKeyDown, true)
        return () => {
          document.removeEventListener('pointerdown', onPointerDown, true)
          document.removeEventListener('keydown', onKeyDown, true)
        }
      }, [open])

      React.useEffect(() => {
        if (!open || active < 0) return
        const node = panelRef.current === null ? null : panelRef.current.querySelector(`[data-item-index='${active}']`)
        if (node !== null) node.focus({ preventScroll: true })
      }, [open, active])

      const run = async (action, key) => {
        if (busy !== null) return
        setBusy(key)
        setNotice(null)
        try {
          const outcome = await action()
          if (!alive.current) return
          setNotice(summary(outcome, tv))
          await load()
        } catch (error) {
          if (!alive.current) return
          setNotice({ kind: 'error', text: `${tv('failed')}: ${error?.payload?.error ?? error?.message ?? 'error'}` })
        } finally {
          if (alive.current) setBusy(null)
        }
      }
      const applyPreset = preset => run(
        () => request('/apply', { method: 'POST', body: JSON.stringify({ name: preset.name }) }),
        preset.name,
      )
      const undoSwitch = () => run(() => request('/undo', { method: 'POST', body: '{}' }), 'undo')

      const onRowClick = () => {
        if (openRef.current && pinnedRef.current) {
          closeNow()
          return
        }
        openNow(true, firstEnabled)
      }
      const onRowKeyDown = event => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
          event.preventDefault()
          openNow(true, firstEnabled)
          return
        }
        if (event.key === 'Escape' && openRef.current) {
          event.preventDefault()
          closeNow()
        }
      }
      const onPanelKeyDown = event => {
        if (event.key === 'Escape') {
          event.preventDefault()
          event.stopPropagation()
          closeNow()
          if (rowRef.current !== null) rowRef.current.focus({ preventScroll: true })
          return
        }
        if (event.key === 'Tab') {
          closeNow()
          return
        }
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp' && event.key !== 'Home' && event.key !== 'End') return
        event.preventDefault()
        if (enabled.length === 0) return
        if (event.key === 'Home') {
          setActive(enabled[0])
          return
        }
        if (event.key === 'End') {
          setActive(enabled[enabled.length - 1])
          return
        }
        const step = event.key === 'ArrowDown' ? 1 : -1
        const at = enabled.indexOf(active)
        setActive(at === -1
          ? (step === 1 ? enabled[0] : enabled[enabled.length - 1])
          : enabled[(at + step + enabled.length) % enabled.length])
      }

      const flyoutStyle = pos === null
        ? { left: 8, top: 0, visibility: 'hidden' }
        : {
            left: `${pos.left}px`,
            width: `${pos.width}px`,
            maxHeight: `${Math.max(80, pos.maxHeight)}px`,
            ...(pos.top === undefined ? { bottom: `${pos.bottom}px` } : { top: `${pos.top}px` }),
          }

      const presetRows = items.map((item, index) => {
        if (item.kind !== 'preset') return null
        return h('button', {
          key: item.id,
          type: 'button',
          role: 'menuitemradio',
          'aria-checked': item.current,
          'data-item-index': index,
          tabIndex: index === active ? 0 : -1,
          disabled: item.disabled,
          className: 'dbp-fly-item',
          onClick: () => applyPreset(item.preset),
        },
          h('span', { className: 'dbp-fly-check' }, item.current ? h(CheckIcon, { size: 14 }) : null),
          h('span', { className: 'dbp-fly-label' }, label(item.label)),
          busy === item.preset.name
            ? h('span', { className: 'dbp-fly-trail' }, h(SpinnerIcon, { size: 12 }))
            : h('span', { className: 'dbp-fly-trail' }, tv('count', { n: item.count })),
        )
      })

      const actionRows = items.map((item, index) => {
        if (item.kind === 'preset') return null
        const icon = item.kind === 'undo' ? h(UndoIcon, { size: 14 }) : h(ManageIcon, { size: 14 })
        const trail = item.kind === 'undo' && busy === 'undo' ? h(SpinnerIcon, { size: 12 }) : null
        return h('button', {
          key: item.id,
          type: 'button',
          role: 'menuitem',
          'data-item-index': index,
          tabIndex: index === active ? 0 : -1,
          disabled: item.disabled,
          className: 'dbp-fly-item',
          onClick: () => {
            if (item.kind === 'undo') {
              undoSwitch()
              return
            }
            closeNow()
            onManage()
          },
        },
          h('span', { className: 'dbp-fly-check' }, icon),
          h('span', { className: 'dbp-fly-label' }, label(item.label)),
          trail === null ? null : h('span', { className: 'dbp-fly-trail' }, trail),
        )
      })

      const body = []
      if (state.status === 'error' && data === null) {
        body.push(h('div', { key: 'error', className: 'dbp-fly-note dbp-fly-error' }, `${t('failed')}: ${state.error}`))
      } else if (presets.length === 0) {
        body.push(h('div', { key: 'empty', className: 'dbp-fly-note' }, state.status === 'ready' || state.status === 'error' ? t('switcherEmpty') : t('switcherLoading')))
      } else {
        body.push(...presetRows)
      }
      body.push(h('div', { key: 'sep', className: 'dbp-fly-sep', role: 'separator' }))
      body.push(...actionRows)
      if (notice !== null) {
        body.push(h('div', {
          key: 'notice',
          className: notice.kind === 'error' ? 'dbp-fly-note dbp-fly-error' : 'dbp-fly-note',
          role: 'status',
        }, notice.text))
      }

      return h('div', {
        ref: rootRef,
        className: 'dbp-sw',
        'data-rail': shownWide ? undefined : true,
        onPointerEnter: armOpen,
        onPointerLeave: armClose,
      },
        h('style', { id: 'dsh-bundle-presets-switcher-style' }, SWITCHER_CSS),
        h('button', {
          ref: rowRef,
          type: 'button',
          className: 'dbp-sw-row',
          'aria-haspopup': 'menu',
          'aria-expanded': open,
          'aria-label': `${t('switcher')} · ${currentLabel}`,
          title: `${t('switcher')} · ${currentLabel}`,
          onClick: onRowClick,
          onKeyDown: onRowKeyDown,
        },
          h('span', { className: 'dbp-sw-glyph' }, h(PluginMark, { size: shownWide ? 16 : 18 })),
          shownWide ? h('span', { className: 'dbp-sw-label' }, t('switcher')) : null,
          shownWide ? h('span', { className: 'dbp-sw-value' }, currentLabel) : null,
        ),
        open ? h('div', {
          ref: panelRef,
          className: 'dbp-fly',
          role: 'menu',
          'aria-label': t('switcher'),
          style: flyoutStyle,
          onPointerEnter: () => {
            window.clearTimeout(timers.current.close)
            timers.current.close = 0
          },
          onPointerLeave: armClose,
          onKeyDown: onPanelKeyDown,
        },
          h('div', { className: 'dbp-fly-head' },
            h('span', { className: 'dbp-fly-title' }, t('switcher')),
            h('span', { className: 'dbp-fly-hint' }, tv('count', { n: selected.length })),
          ),
          ...body,
        ) : null,
      )
    }

    function PresetsPanel({ t: frameSeat, seat, resolve }) {
      /** The frame's seat re-renders on a language switch; ours is the fallback. */
      const t = typeof frameSeat === 'function' ? frameSeat : typeof seat === 'function' ? seat : fallbackT
      const tv = (key, vars) => format(t, key, vars)
      const label = value => (typeof resolve === 'function' ? resolve(value) : text(value))
      const [state, setState] = React.useState({ status: 'loading', data: null, error: null })
      const [name, setName] = React.useState('')
      const [note, setNote] = React.useState('')
      const [busy, setBusy] = React.useState(null)
      const [notice, setNotice] = React.useState(null)
      const [editing, setEditing] = React.useState(null)
      const [filter, setFilter] = React.useState('')
      const [showCurrent, setShowCurrent] = React.useState(false)
      const [conflict, setConflict] = React.useState(null)
      const refreshGen = React.useRef(0)

      const refresh = React.useCallback(async () => {
        const generation = ++refreshGen.current
        try {
          const data = await request('/state')
          if (generation !== refreshGen.current) return
          setState({ status: 'ready', data, error: null })
        } catch (error) {
          if (generation !== refreshGen.current) return
          setState({ status: 'error', data: null, error: error.message })
        }
      }, [])

      React.useEffect(() => {
        refresh()
      }, [refresh])

      const data = state.data
      const selected = data?.selected ?? []
      const allBundles = data?.bundles ?? []
      const presets = [...(data?.presets ?? [])].sort((left, right) => String(right.savedAt).localeCompare(String(left.savedAt)))
      const last = data?.last ?? null
      const currentPresetName = matchPreset(presets, selected, data?.bundles, appliedPresetName(data))?.name ?? null

      const run = async (key, task) => {
        if (busy !== null) return
        setBusy(key)
        setNotice(null)
        try {
          await task()
        } catch (error) {
          const payload = error?.payload ?? {}
          const known = {
            'invalid-name': 'errInvalidName',
            'unknown-preset': 'errUnknownPreset',
            'nothing-to-undo': 'errNothingToUndo',
            busy: 'errBusy',
            'untrusted-request': 'errUntrusted',
            timeout: 'errTimeout',
          }
          if (payload.error === 'unappliable' && Array.isArray(payload.blocked)) {
            setNotice({ kind: 'error', text: `${t('unappliable')}: ${describeBlocked(tv, payload.blocked)}` })
          } else if (known[payload.error] !== undefined) {
            setNotice({ kind: 'error', text: t(known[payload.error]) })
          } else {
            setNotice({ kind: 'error', text: error.message })
          }
        } finally {
          setBusy(null)
        }
      }

      const save = (overwrite = false, target = name.trim()) => run('save', async () => {
        const trimmed = target
        if (trimmed.length === 0) return
        try {
          await request('/save', {
            method: 'POST',
            body: JSON.stringify({ name: trimmed, note: note.trim(), overwrite }),
          })
        } catch (error) {
          if (error?.payload?.error === 'name-exists') {
            setConflict({ name: trimmed })
            setNotice({ kind: 'info', text: tv('nameExists', { name: trimmed }) })
            return
          }
          throw error
        }
        setConflict(null)
        setName('')
        setNote('')
        setNotice({ kind: 'info', text: `${t('savedNotice')} · ${trimmed}` })
        await refresh()
      })

      const preview = preset => run(`preview:${preset.name}`, async () => {
        const payload = await request(`/preview?name=${encodeURIComponent(preset.name)}`)
        const plan = payload.plan ?? {}
        const lines = []
        if (plan.enable?.length > 0) lines.push(`+ ${plan.enable.map(shortName).join(', ')}`)
        if (plan.disable?.length > 0) lines.push(`− ${plan.disable.map(shortName).join(', ')}`)
        if (plan.unknown?.length > 0) lines.push(`${t('skipped')}: ${plan.unknown.map(shortName).join(', ')}`)
        if (payload.blocked?.length > 0) lines.push(`${t('unappliable')}: ${describeBlocked(tv, payload.blocked)}`)
        setNotice({ kind: 'info', text: lines.length === 0 ? t('noop') : lines.join('   ') })
      })

      const apply = preset => run(`apply:${preset.name}`, async () => {
        const outcome = await request('/apply', { method: 'POST', body: JSON.stringify({ name: preset.name }) })
        setNotice(summary(outcome, tv))
        await refresh()
      })

      const undo = () => run('undo', async () => {
        const outcome = await request('/undo', { method: 'POST', body: '{}' })
        setNotice(summary(outcome, tv))
        await refresh()
      })

      const remove = preset => run(`remove:${preset.name}`, async () => {
        await request('/delete', { method: 'POST', body: JSON.stringify({ name: preset.name }) })
        if (editing?.name === preset.name) setEditing(null)
        await refresh()
      })

      const startEdit = preset => {
        setFilter('')
        setNotice(null)
        setEditing({ name: preset.name, draft: [...(preset.bundles ?? [])], note: preset.note ?? '' })
      }

      const toggle = bundleName => {
        setEditing(current => {
          if (current === null) return current
          const draft = current.draft.includes(bundleName)
            ? current.draft.filter(item => item !== bundleName)
            : [...current.draft, bundleName]
          return { ...current, draft }
        })
      }

      const saveEdits = () => run('saveEdits', async () => {
        const current = editing
        if (current === null) return
        await request('/update', {
          method: 'POST',
          body: JSON.stringify({ name: current.name, bundles: current.draft, note: current.note }),
        })
        setEditing(null)
        setNotice({ kind: 'info', text: `${t('savedNotice')} · ${current.name}` })
        await refresh()
      })

      const visibleBundles = (() => {
        const query = filter.trim().toLowerCase()
        const sorted = [...allBundles].sort((left, right) => {
          if (left.official !== right.official) return left.official ? -1 : 1
          return left.name.localeCompare(right.name)
        })
        if (query.length === 0) return sorted
        return sorted.filter(bundle => {
          const haystack = `${bundle.name} ${label(bundle.title)} ${label(bundle.description)}`.toLowerCase()
          return haystack.includes(query)
        })
      })()

      const missingInDraft = editing === null
        ? []
        : editing.draft.filter(item => !allBundles.some(bundle => bundle.name === item))

      const memberLine = names => {
        const head = names.slice(0, 5).map(shortName).join(' · ')
        const rest = names.length - Math.min(5, names.length)
        return rest > 0 ? `${head} ${tv('more', { n: rest })}` : head
      }

      return h('div', { className: 'dbp-page' },
        h('style', { id: STYLE_ID }, CSS),

        h('section', { className: 'dbp-group' },
          h('div', { className: 'dbp-group-head' },
            h('h3', { className: 'dbp-group-title' }, t('current')),
            h('span', { className: 'dbp-hint' }, tv('count', { n: selected.length })),
            h(Btn, {
              onClick: () => setShowCurrent(value => !value),
              'aria-expanded': showCurrent,
            }, showCurrent ? t('collapseList') : t('viewList')),
            h(Btn, { onClick: refresh, disabled: busy !== null }, t('refresh')),
            h(Btn, {
              onClick: undo,
              disabled: busy !== null || last === null,
              title: last === null ? t('noUndo') : `${t('savedAt')} ${time(last.savedAt ?? last.at)}`,
            }, busy === 'undo' ? t('busyUndo') : t('undo')),
          ),
          h('p', { className: 'dbp-hint' }, t('hint')),

          h('div', { className: 'dbp-card' },
            h('div', { className: 'dbp-card-head' },
              h('span', { className: 'dbp-icon' }, h(StackIcon, { size: 24 })),
              h('div', { className: 'dbp-main' },
                h('div', { className: 'dbp-title' }, tv('count', { n: selected.length })),
                h('div', { className: 'dbp-members', title: selected.join('\n') }, memberLine(selected)),
              ),
              h('div', { className: 'dbp-end' },
                h('input', {
                  className: 'dbp-input',
                  style: { width: 180 },
                  value: name,
                  placeholder: t('namePlaceholder'),
                  onChange: event => {
                    setName(event.target.value)
                    setConflict(null)
                  },
                  onKeyDown: event => {
                    if (event.key === 'Enter') save()
                  },
                }),
                h('input', {
                  className: 'dbp-input',
                  style: { width: 130 },
                  value: note,
                  placeholder: t('notePlaceholder'),
                  onChange: event => setNote(event.target.value),
                  onKeyDown: event => {
                    if (event.key === 'Enter') save()
                  },
                }),
                h(Btn, {
                  variant: 'primary',
                  onClick: () => save(false),
                  disabled: busy !== null || name.trim().length === 0,
                }, busy === 'save' ? t('busySaving') : t('save')),
              ),
              conflict === null
                ? null
                : h('div', { className: 'dbp-toolbar' },
                  h('span', { className: 'dbp-hint' }, tv('overwriteAsk', { name: conflict.name })),
                  h(Btn, { variant: 'danger', onClick: () => save(true, conflict.name), disabled: busy !== null }, t('overwrite')),
                  h(Btn, { onClick: () => setConflict(null), disabled: busy !== null }, t('cancel')),
                ),
            ),

            showCurrent
              ? h('div', { className: 'dbp-editor' },
                h('div', { className: 'dbp-rows' },
                  selected.map(bundleName => {
                    const bundle = allBundles.find(item => item.name === bundleName)
                    const title = (bundle && label(bundle.title)) || shortName(bundleName)
                    const description = bundle ? label(bundle.description) : ''
                    return h('div', { key: bundleName, className: 'dbp-row dbp-row--static' },
                      h('span', { className: 'dbp-row-icon' },
                        bundle?.icon
                          ? h('img', { src: bundle.icon, alt: '' })
                          : shortName(bundleName).slice(0, 1).toUpperCase(),
                      ),
                      h('div', { className: 'dbp-row-main' },
                        h('div', { className: 'dbp-row-line' },
                          h('span', { className: 'dbp-row-title' }, title),
                          h('span', { className: 'dbp-row-id' }, bundleName),
                        ),
                        description ? h('div', { className: 'dbp-row-desc' }, description) : null,
                      ),
                      h('span', { className: 'dbp-row-note' }, bundle?.version ?? ''),
                    )
                  }),
                ),
                h('p', { className: 'dbp-hint' }, t('readonlyHint')),
              )
              : null,
          ),
        ),

        notice !== null
          ? h('p', { className: notice.kind === 'error' ? 'dbp-error' : 'dbp-notice', role: 'status' }, notice.text)
          : null,
        state.status === 'error' ? h('p', { className: 'dbp-error' }, state.error) : null,
        data?.recoveredPath
          ? h('p', { className: 'dbp-error' }, `${t('recovered')}: ${data.recoveredPath}`)
          : null,

        h('section', { className: 'dbp-group' },
          h('div', { className: 'dbp-group-head' },
            h('h3', { className: 'dbp-group-title' }, t('saved')),
            h('span', { className: 'dbp-hint' }, presets.length > 0 ? tv('count', { n: presets.length }) : ''),
          ),

          presets.length === 0
            ? h('p', { className: 'dbp-hint' }, t('empty'))
            : presets.map(preset => {
              const isCurrent = currentPresetName === preset.name
              const isEditing = editing?.name === preset.name
              return h('div', { key: preset.name, className: 'dbp-card' },
                h('div', { className: 'dbp-card-head' },
                  h('span', { className: 'dbp-icon' }, h(StackIcon, { size: 24 })),
                  h('div', { className: 'dbp-main' },
                    h('div', { className: 'dbp-title' },
                      h('span', { style: { overflow: 'hidden', textOverflow: 'ellipsis' } }, preset.name),
                      isCurrent ? h('span', { className: 'dbp-badge' }, t('matched')) : null,
                    ),
                    h('div', { className: 'dbp-desc' },
                      `${t('savedAt')} ${time(preset.savedAt)} · ${tv('count', { n: (preset.bundles ?? []).length })}`,
                      preset.note ? ` · ${preset.note}` : '',
                    ),
                    h('div', { className: 'dbp-members', title: (preset.bundles ?? []).join('\n') }, memberLine(preset.bundles ?? [])),
                  ),
                  h('div', { className: 'dbp-end' },
                    h(Btn, { onClick: () => (isEditing ? setEditing(null) : startEdit(preset)), disabled: busy !== null }, isEditing ? t('collapse') : t('edit')),
                    h(Btn, { onClick: () => preview(preset), disabled: busy !== null }, busy === `preview:${preset.name}` ? t('busyPreview') : t('preview')),
                    h(Btn, { variant: 'primary', onClick: () => apply(preset), disabled: busy !== null }, busy === `apply:${preset.name}` ? t('busyApplying') : t('apply')),
                    h(Btn, { variant: 'danger', onClick: () => remove(preset), disabled: busy !== null }, t('remove')),
                  ),
                ),

                isEditing ? h('div', { className: 'dbp-editor' },
                  h('div', { className: 'dbp-toolbar' },
                    h('input', {
                      className: 'dbp-input',
                      'data-grow': true,
                      value: filter,
                      placeholder: t('filter'),
                      onChange: event => setFilter(event.target.value),
                    }),
                    h('span', { className: 'dbp-hint' }, tv('selectedCount', { n: editing.draft.length, total: allBundles.length })),
                    h(Btn, {
                      onClick: () => setEditing(current => (current === null ? current : { ...current, draft: [...selected] })),
                      disabled: busy !== null,
                    }, t('resetToCurrent')),
                    h(Btn, {
                      onClick: () => setEditing(current => {
                        if (current === null) return current
                        // Protected or unknown bundles cannot be turned off, so
                        // "turn all off" would build a preset that always fails.
                        const keep = current.draft.filter(item => {
                          const bundle = allBundles.find(candidate => candidate.name === item)
                          return bundle === undefined || bundle.readOnlyReason !== null
                        })
                        return { ...current, draft: keep }
                      }),
                      disabled: busy !== null,
                    }, t('clearAll')),
                  ),

                  h('div', { className: 'dbp-rows' },
                    visibleBundles.map(bundle => {
                      const on = editing.draft.includes(bundle.name)
                      const installable = (bundle.availability === 'installation' || bundle.availability === 'profile') && bundle.error === null
                      const locked = on ? bundle.readOnlyReason !== null : !installable
                      const note = on
                        ? (bundle.readOnlyReason === null ? '' : t('protectedHint'))
                        : (installable ? '' : reasonLabel(tv, bundle.error ?? 'unavailable'))
                      return h('div', { key: bundle.name, className: 'dbp-row' },
                        h('span', { className: 'dbp-row-icon' },
                          bundle.icon ? h('img', { src: bundle.icon, alt: '' }) : shortName(bundle.name).slice(0, 1).toUpperCase(),
                        ),
                        h('div', { className: 'dbp-row-main' },
                          h('div', { className: 'dbp-row-line' },
                            h('span', { className: 'dbp-row-title' }, label(bundle.title) || shortName(bundle.name)),
                            h('span', { className: 'dbp-row-id' }, bundle.name),
                          ),
                          label(bundle.description)
                            ? h('div', { className: 'dbp-row-desc' }, label(bundle.description))
                            : null,
                        ),
                        note === '' ? null : h('span', { className: 'dbp-row-note' }, note),
                        h(Switch, { on, disabled: locked, label: bundle.name, onChange: () => toggle(bundle.name) }),
                      )
                    }),
                    missingInDraft.map(bundleName => h('div', { key: bundleName, className: 'dbp-row' },
                      h('span', { className: 'dbp-row-icon' }, shortName(bundleName).slice(0, 1).toUpperCase()),
                      h('div', { className: 'dbp-row-main' },
                        h('div', { className: 'dbp-row-line' },
                          h('span', { className: 'dbp-row-title' }, shortName(bundleName)),
                          h('span', { className: 'dbp-row-id' }, bundleName),
                        ),
                        h('div', { className: 'dbp-row-desc' }, t('missing')),
                      ),
                      h(Switch, { on: true, disabled: true, label: bundleName, onChange: () => {} }),
                    )),
                  ),

                  h('div', { className: 'dbp-toolbar' },
                    h('span', { className: 'dbp-hint' }, t('orderHint')),
                    h('span', { style: { flex: '1 1 auto' } }),
                    h(Btn, { onClick: () => setEditing(null), disabled: busy !== null }, t('cancel')),
                    h(Btn, { variant: 'primary', onClick: saveEdits, disabled: busy !== null }, busy === 'saveEdits' ? t('busySaving') : t('saveEdits')),
                  ),
                ) : null,
              )
            }),
        ),
      )
    }

    return {
      inject: ['slots', 'locale', 'layout'],
      apply(ctx) {
        const locale = ctx.get('locale')
        if (typeof locale?.register === 'function') {
          try {
            ctx.effect(() => locale.register('dshBundlePresets', { zh: DICTIONARY.zh, en: DICTIONARY.en }))
          } catch (error) {
            // A host that rejects this namespace keeps the local fallback.
            console.warn('dsh-bundle-presets: locale dictionary not registered', error)
          }
        }
        let seat = fallbackT
        try {
          const bound = typeof locale?.bind === 'function' ? locale.bind('dshBundlePresets') : undefined
          // A hot reload can dispose the previous dictionary after the new
          // instance bound it; a key that resolves to itself means it is gone.
          if (typeof bound === 'function' && bound('tab') !== 'tab') seat = bound
        } catch {
          seat = fallbackT
        }
        const resolve = typeof locale?.resolveText === 'function' ? value => locale.resolveText(value) : undefined
        ctx.slots.inject('plugins.tab', () => ctx.slots.register({
          name: 'plugins.tab',
          id: 'bundle-presets',
          order: 5,
          label: () => seat('tab'),
          locale: 'dshBundlePresets',
        }, (ownerProps = {}) => h(PresetsPanel, { ...ownerProps, seat, resolve })))
        // The foot of the sidebar already reserves one row above Settings, and
        // its owner hands each action only the column state; the row and its
        // flyout are ours to draw.
        const layout = ctx.get('layout')
        /**
         * Open the Plugins page on our contributed tab. The page owns its tab
         * selection and only exposes `openList` / `openBundle` (both force the
         * Installed tab), so land on the list first and then select the tab
         * button the page renders for this registration. If it never appears
         * (a page that changed its tab markup), fall back to our own panel.
         */
        const onManage = () => {
          try {
            const navigation = ctx.get('pluginNavigation')
            if (typeof navigation?.openList === 'function') navigation.openList()
            else layout?.selectPanel?.('plugins')
          } catch (error) {
            console.warn('dsh-bundle-presets: cannot open the Plugins page', error)
          }
          let frames = 0
          const selectTab = () => {
            const button = document.querySelector('[role="tab"][id$="-bundle-presets"]')
              ?? document.querySelector('[id$="-bundle-presets"][role]')
            if (button !== null) {
              button.click()
              return
            }
            if (++frames > 40) {
              console.warn('dsh-bundle-presets: the Plugins page did not render the Presets tab')
              return
            }
            window.requestAnimationFrame(selectTab)
          }
          window.requestAnimationFrame(selectTab)
        }
        ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
          name: 'sidebar.footer.action',
          id: 'bundle-presets',
          order: 20,
          label: () => seat('switcher'),
          locale: 'dshBundlePresets',
        }, (ownerProps = {}) => h(PresetSwitcher, { ...ownerProps, seat, resolve, onManage })));
      },
    }
  },
})
