# 插件组合预设 / Bundle presets

把「当前 profile 里哪些 bundle 被选中」当成一套可以命名的组合存下来，随时一键换回来。

## 它做什么

- **存为预设**：读取此刻 `dsh.profile.bundles` 的实际选中结果（不是模板，是当前真在跑的集合），写进 `bundle-presets.json`。同名预设不会被静默覆盖：先返回 409，页面问一句「覆盖原预设？」，确认后带 `overwrite` 重发。
- **套用**：算出「要开 / 要关」的差集，**先预检再动手**（要开的必须已装且能读、要关的不能是受保护 bundle），有任意一项做不成就整单拒绝（HTTP 409，零写入）；能做成时逐个调用插件管理器的 `setBundleEnabled`，开启在前、关闭在后。某一步即使写盘成功但重组失败，会立刻反向恢复那一步。
- **撤销**：只有真正发生变化的套用才会写 `last`（空操作不会覆盖它）；撤销成功后再把 `last` 指向刚离开的组合，所以可以来回切。
- **受保护 bundle 关不掉**：`dsh-base`、`dsh-web-app` 这类含受保护行的 bundle 由插件管理器拒绝关闭，预设套用不会把界面关死。

## 侧栏快速切换

侧栏底部（设置上方）注册了一行 **插件组合预设**（`sidebar.footer.action`，order 20）。它只消费 `{ wide }`：

- 悬停约 140ms 展开右侧浮出菜单，指针离开该行与菜单约 280ms 后关闭；触屏/粗指针不触发悬停，只能点击。
- 菜单按 `/state` 的 `presets` 列表渲染，当前这套用集合相等判定并打勾；每行尾部显示 bundle 数，套用中显示转圈。
- 菜单底部固定两行：**撤销上次切换**（无 `last` 时禁用）、**管理预设…**（跳到 Plugins 页并选中 **组合预设** 标签；标签选择属于那个页面自己，只能先 `pluginNavigation.openList()` 再点它渲染出来的标签按钮）。
- 横向几何与侧栏原生行（`dsh-client-ui-sidebar` 的 `.panelRow`）在展开态一致：280px 侧栏下，行盒 `8→272`、3px 透明 inset 边框让悬停底板落在 `11→269`、9px 内边距让图标落在 20px、label 落在 42px，和「更多」及导航行完全一致；高度 32px、圆角 `--dsw-radius-md`、悬停色 `--dsw-alias-interactive-bg-hover` 同理（插件显式写出 `width: 100%`、字号与变量回退值）。悬停只用 `background-color` 且和原生一样放进 `@media (hover: hover)`：`background` 简写会把 `background-clip` 重置回 `border-box`，3px inset 就没了——底板会变成 `8→272`，左右各比原生宽 3px；触屏上 `:hover` 也不会粘住。
- 行首图标是 `icon.svg` 的**单色版**（三条递减的层 + 对勾，`currentColor` 描边，16px），和其他侧栏导航字形同一笔画，不发额外请求。
- 「当前是哪一套」按**能真正套用的子集**比较：预设里点名的 bundle 如果已从 profile 移除，套用时会被跳过，所以它也参与不了匹配。两套预设化简后相同时，显示 Host 记录的 `applied`（旧文件回退到 `last.name` 的 `before <预设名>`）。

## 它不做什么

- 不切 profile。它只改**当前** profile 的 bundle 组合；会话、设置、凭据、profile 目录都不变。
- 不装包。预设里的 bundle 必须已经装在这个 profile 里；没装的会被跳过并在结果里列名。
- 不手写 `package.json` / `cordis.patch.yml`。写清单和 HMR 重组的活都交给插件管理器，锁和兼容性校验由它负责。

## 用法

1. 打开 **Plugins**，顶部标签栏里选 **组合预设**（在「已安装 / 插件市场 / 发现」旁边）。
2. 先在 Plugins 页把组合调成你想要的样子，然后在卡片里起个名字 → **存为预设**。
3. 点预设卡片上的 **编辑**，会展开一份和原生插件列表一样的开关列表（带标题、包名、简介、筛选框）：拨开关改这套预设，**保存修改** 后生效；右下角可以 **恢复成当前组合** 或 **全部关闭**。
4. 之后点 **套用** 即切换；点 **撤销上次切换** 回到上一套。

也可以直接打接口（仅本机回环）：

```sh
# 端口从当前 Web GUI 地址里取：http://127.0.0.1:62118 → 62118（桌面 App 每次启动会换）
PORT=62118
B="http://127.0.0.1:$PORT/api/bundle-presets"
curl -s "$B/state"
curl -s "$B/preview?name=写作套装"   # 只看差集，不动任何东西
curl -s -X POST "$B/save"   -H 'content-type: application/json' -d '{"name":"写作套装"}'          # 同名返回 409，加 "overwrite":true 才覆盖
curl -s -X POST "$B/update" -H 'content-type: application/json' -d '{"name":"写作套装","bundles":["@deepseek-ai/dsh-base","@deepseek-ai/dsh-web-app","dshmarket"]}'   # 只改已存在的预设
curl -s -X POST "$B/apply"  -H 'content-type: application/json' -d '{"name":"写作套装"}'          # 预检不过返回 409 unappliable
curl -s -X POST "$B/undo"
curl -s -X POST "$B/delete" -H 'content-type: application/json' -d '{"name":"写作套装"}'
```

端口换成你正在用的那个（桌面 App 的地址在启动日志 / `ctx.webServer` 里）。

## 测试

```sh
node tests/plan.test.mjs     # 纯函数
node tests/routes.test.mjs   # 路由级（会起一个临时 HTTP server，不碰真实 profile）
```

路由测试是这轮修复的护栏：它在临时目录里起真 server、把 `pluginManager` 换成 stub，因此能复现"套用后写队列死锁"这类只在真实 handler 里出现的问题。

## 边界与已知限制

- **只对 Web 形态有效**：bundle 声明了 `pluginManager` 与 `webServer` 两个必需服务，所以只会在 web / desktop 这类有浏览器面的 profile 里挂载；headless / SDK / ACP profile 不会启动它。
- **状态文件按 profile 隔离**：存在 `<profile 目录>/bundle-presets.json`，不跨 profile 同步。
- **切换是重活**：一次套用会触发多次重组，正在运行的会话可能短暂看到插件上下线；这是 HMR 重组的正常代价，不是数据丢失。
- **接口围栏与官方 `/api` 一致**：`Host` 必须是回环地址（`localhost` / `127.0.0.0/8` / `[::1]`），否则 403 —— 这是 DNS rebinding 唯一伪造不了的一环；带 `Sec-Fetch-Site: cross-site` 拒绝；带 `Origin` 时必须与 `Host` 同authority；socket 对端也必须是回环。远程部署（反代）下浏览器访问会被拒绝，需要自行加鉴权后再放开。这些路由不校验桌面 App 的页面令牌：同机进程本来就能读写 `~/.dsh`，Host 围栏是这里的边界。
- **文件锁**：读改写包在 `bundle-presets.json.lock`（跨进程）里，2s 等待后返回 503；15s 以上的陈旧锁会被接管，释放时校验自己的 token，不会误删别人的锁。桌面 App 与 `dsh web` 同开一个 profile 时不会互相覆盖预设。
- **界面语言**：字典注册进 `dshBundlePresets` 命名空间（`ctx.locale.register`），文案走 `ctx.locale.bind`，bundle 标题/简介走 `ctx.locale.resolveText`；宿主没有 locale 服务时回落到 `navigator.language`。
- **损坏自愈**：状态文件解析失败时会被改名成 `bundle-presets.json.corrupt-<时间戳>` 并在页面提示，然后从空列表继续，不会把页面卡在 500。
- **预设不记录 bundle 版本**，只记名字；升级/卸载后名单可能变化，套用时会跳过不存在的项，编辑时缺失项会单列并标出。
- **编辑只改预设文件**，不碰当前 profile；点了 **套用** 才真正切换。

## 文件

| 文件 | 作用 |
| --- | --- |
| `index.js` | Host 半体：路由、读写预设文件、驱动 `pluginManager.setBundleEnabled` |
| `plan.js` | 纯函数：差集规划与名称校验（可单测） |
| `client.js` | 浏览器半体：Plugins 页的 `plugins.tab` 标签页 + 侧栏底部的快速切换行 |
| `cordis.patch.yml` | bundle 层，插入 `bundle-presets` 这一行 |
| `tests/plan.test.mjs` | 纯函数：差集、名称校验、预检拒绝、self 保护 |
| `tests/routes.test.mjs` | 路由级：真 HTTP + stub 插件管理器，覆盖套用/回滚/撤销快照/预检拒绝/围栏/损坏自愈/并发保存/文件锁 |
