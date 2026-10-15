### 2026-10-15：Casino 桌面六个分类已在原页面补入

- 保留原 `65:2`，根据已保存的原站 1440 实测资料补入 Bonus buy、Bonus wagering、Jili Games、New、Only on 1win、Quick games 六区，共 54 个游戏卡片实例；分类坐标使用原站记录，图标为矢量。
- 15 张新增封面已验证图片尺寸并可渲染；WebP 上传虽然成功但无法读取元数据，已改用保持像素的 PNG。人数与 playing 标签改为内容自适应，避免长数字截断。
- 页面约 1440 × 5560，原站记录高度 5559；剩余小幅几何差异及全页最终对照仍待审核，不能标记为 100%。原交付 HTML 未应用旧 Casino 修补脚本。
- 新增独立状态组件：收起侧栏 `113:2`（实例 `113:3`）；供应商面板 `127:11087`（实例 `127:11088`，原站最终样式 QA 待完成）。没有创建重复整页。Figma Overview `110:2` 已加入交接说明。
- 证据：`casino-fill-result.json`、`casino-image-repair-result.json`、`casino-six-sections-complete.png`、`casino-quick-row-verified.png`；临时素材图层已清理。

### 2026-10-15：分类页组件复用与 Fishing 首次迁移

- Casino lobby、Live Casino、New 各新增复用 24 张卡片（合计 72）；卡片边界位置／尺寸最大变化 0px，未复制整页。
- Fishing 桌面首次迁入 `105:9103`，1440 × 1948.650，24 张卡片、27 个共享实例；JILI `65:5372` 与 New `65:15495` 在原位补公共页尾，移除加载占位。
- 当前 10 个不同桌面页面、3 个不同手机页面；Fishing 手机版 `107:805` 已完成原生迁移、公共页尾和 12 个共享实例，卡片边界变化 0px，原站最终 QA 待完成。
- Quick games 的底部仍缺少页尾，内容也有已知缺口；原站最终逐页核对、其他手机页、菜单／筛选／弹窗仍未完成。
- 证据：`grid-pass-lobby.json`、`grid-pass-live.json`、`grid-pass-new.json`、`fishing-desktop-result.json`、`fishing-desktop.png`。本段只报告迁移及布局检查，不表示原站 100% 相同。

### 2026-10-15：Bonus wagering 页尾缺失已在原 Frame 修复

- 桌面 `82:6719`：1440 × 1948.659，24 张卡片、27 个组件实例；移除加载占位，补入共享页尾。
- 手机 `94:421`：390 × 1828.816，9 张卡片、12 个组件实例；移除加载占位，补入共享页尾。两种尺寸各保留一份，文字／图标／布局可编辑。
- 当前 9 个不同桌面页面、2 个不同手机页面；并非全站完成。Slots 唯一旧 Frame 仍待 1440 原位更新，Bonus buy 旧导入仍在处理。
- 网格卡片增加桌面／Live／手机三个结构变体；组件替换保留网格位置、行数和高度。1win games 转换前后截图像素差 0；其他转换的少量渲染差异见 QA JSON，不计为原站最终验收。
- 证据：`bonus-wagering-repaired.png`、`bonus-wagering-mobile-repaired.png`、`wager-repaired-qa.json`、`wager-mobile-qa.json`、`grid-qa.json`（均在 qa/figma-editable-2026-10-14）。

### 最新约束：复用已有设计，不新增重复整页 Frame（2026-10-14）

用户要求先清理重复设计，并复用已有页面。已删除 11 个重复参考 Frame：Desktop 页 9 个、Mobile 页 1 个、Overview 页 1 个。当前保留 8 个不同桌面页面及 1 个手机首页；桌面 Slots 唯一参考仍为 1536，需在原 `51:943` 内更新成 1440，不能新增第二份。

首页复用 `24:2` / `37:2`，接回共享组件后重新比较，迁移视觉差异仍约 0.070% / 0.067%。所有页面未完成与原站全状态验收，不能把去重算作全站完成。新规则已写入 Design Rule；自动处理脚本改为原 Frame 更新，取消整页 clone。

证据：`qa/figma-editable-2026-10-14/duplicate-cleanup-result.json`、`home-reused-qa.json`、`state.json`。本次只清理明确属于本轮的重复参考；共享组件与两种响应式范围保留。

下一步：检查尚在处理中的捕获是否产生迟到重复；如发生，合并到保留 Frame 后删除临时结果。然后按账本继续补齐页面、菜单／筛选／弹窗和原站设计差异，所有已存在页面原位修改。

## 当前任务：可编辑 Figma 设计（2026-10-14）

用户已停止之前的 Casino HTML 审核；当前工作改为把 1win 全站游客设计交给设计师编辑。范围已确认：桌面 1440px、手机 390px，包含菜单、筛选和弹窗。交付目标是原生文字、矢量、自动布局与共享组件；原始游戏封面／横幅允许作为独立图片素材，整页截图不得作为设计图层。

文件：[1win Figma](https://www.figma.com/design/OmnjmGzEsH8UcsGk8uJJkk/1win)。

- [x] 核查空文件、现有库与本地共享组件；不合适的其他产品导航没有用于 1win。
- [x] 建立颜色／尺寸变量与 Inter 文字样式，并视觉核验 Design System 页。
- [x] 首页桌面与手机完成原生图层迁移及共享组件实例：桌面 `24:2`（39 个实例）、手机 `37:2`（16 个实例）。组件化与本地原生捕获比较的变化像素比例分别约 0.070% / 0.067%，平均通道差约 0.001；这只证明迁移保真，不等同与原站全站 100% 一致。
- [ ] 本地 31 个入口全部迁移成 1440 / 390 设计；当前 Casino 页面组捕获中。首次新标签尺寸回到浏览器默认 1536，必须按精确 1440 重采后验收，不能计入完成。
- [ ] 菜单展开／收起、移动抽屉、供应商／搜索／筛选及游客弹窗状态补齐并组件化。
- [ ] 根据原站证据补 Casino 已知缺口、尚未实现路由和其他设计差异；不得把现有 HTML 当作全站验收分母。
- [ ] 清理捕获参考、确认所有页面没有整页图片、整理 Figma 内交接说明并最终视觉审核。

详细节点和进度账本：`qa/figma-editable-2026-10-14/state.json`。验证截图与报告放在同目录，不新增根 Markdown 文档。

独立 Figma 预览处理了原 HTML `connect-src 'none'` 导致素材读取／提交失败的问题，并把 CSS mask 转为原 SVG 矢量；交付 HTML 的安全策略和源码没有因此更改。之前未完成的 HTML 审核保持停止，旧待办保留供后续追溯。

# Progress Workflow — 1win

最新版本：**2026-10-15**（Asia/Kuala_Lumpur）。本节是接手 agent（Cursor 等）的唯一进度依据；设计/代码规则查 **Design Rule.md**。本文件顶部的 Figma 段落属于另一条工作线，不要改它。

---

## 0. 一分钟了解项目

- **目标**：用 HTML5 + CSS + 原生 JS 1:1 克隆 https://one-vv3591.com/（设计 + 前端行为）。游客 + Demo（已登录展示）两种状态；五个尺寸 1920×1080 / 1440×900 / 768×1024 / 430×932 / 390×844。直接双击 HTML（file://）也要显示图标和图片。
- **用户规则**：全部自己完成，不要问用户；只做本地展示，不接真实账户/支付/投注；不输入任何凭据；Demo 数据脱敏（姓名→Demo user，ID→ID 00000000，余额→0.00）。
- **当前阶段**：5 步缺口计划已完成 Step 1、2、3；**下一步是 Step 4**（用已有采集生成新页面，见 §4）。Step 5 的采集部分完成。
- **规模**：146 个 HTML 入口（见 §3）。

## 1. 架构速读（改代码前必须知道）

| 位置 | 作用 |
|---|---|
| `<page>.html` | 页面入口：head + 1440 初始状态 + 脚本 |
| `js/<page>.js` | `window.PAGE_STATES={"<page>-<WxH>":{html,attrs}}`，游客五尺寸状态 |
| `js/<page>-auth.js` | `window.AUTH_PAGE_STATES`，Demo 状态（URL 加 `?preview=auth`） |
| `components/header.html`、`sidebar.html`、`footer.html` | 共享组件；状态里用 `<template data-shared-component="…">` 引用，`node scripts/build-components.mjs` 构建 |
| `js/common.js` | 全站唯一交互脚本：按窗口宽度切状态、侧栏、弹窗、轮播、投注单、筛选、Show more、游戏页、无限滚动等 |
| `js/routes.js` | `window.PROJECT_ROUTES`：原站路径 → 本地文件；另有 `sportFilters`、`categories` |
| `js/dialogs.js`、`js/account-dialogs.js` | 登录/注册/语言等弹窗状态 |
| `css/audit.css`、`styles.css`、`local.css`、`inline-masks.css` | 原站 CSS 副本 / 本地补丁 / mask 变量 |
| `assets/audit-<sha20>.<ext>` + `qa/asset-provenance.json` | 本地化后的原站图片 |

**原站特点**：Vue SPA；内容懒加载（必须滚动、可见才渲染）；有些详情页只在站内跳转时加载（直接打开 URL 会被重定向）；Betwave 没有 `/en/` 前缀时会按 IP 变成马来语，一律用 `/en/betwave/...`。

## 2. 工具链（从原站采集并生成页面）

> Windows Git Bash 会把以 `/` 开头的参数改写成 `C:/Program Files/Git/...`，命令前一律加 `MSYS_NO_PATHCONV=1`；Python 输出非 ASCII 时加 `PYTHONIOENCODING=utf-8`。采集需要外网和本机 Chrome（无头）。

1. **采集页面**（默认五尺寸；已存在的文件会跳过，中断后重跑即可续）：
   `MSYS_NO_PATHCONV=1 node --experimental-websocket scripts/reference-capture-cdp.mjs --map map.json --out DIR [--sizes 1440x900,...] [--settle 8000] [--force]`
   map 的值可为 `"/route"`；`{"route":"/x","click":"Show more"}`（一直点到按钮消失）；`{"route":"/x/1","via":"/x"}`（先打开 via，再用 Vue router 站内跳转）。
2. **在原站跑探测脚本**：`MSYS_NO_PATHCONV=1 node --experimental-websocket scripts/reference-run-cdp.mjs --route /x --script scripts/probes/<probe>.js --out x.json --sizes 1440x900,390x844`（不写 `--sizes` 只跑 1440）。探测脚本放在 `scripts/probes/`。
3. **生成页面**：`python scripts/build-page-from-capture.py --page <name> --route <原站路径> --template <相近的现有页面> --captures DIR --date YYYY-MM-DD --title "<标题>"` → 写 html、游客/Demo 状态，补 CSS，注册 routes.js，登记 footer 签名。
4. **按需 CSS**（弹窗/展开后才加载的样式）：`python scripts/add-missing-css.py --css <样式捕获.json> --markup <用到的 js/html> --label x --date …`
5. **收尾检查**（每完成一步都跑）：
   `python scripts/migrate-shared-components.py` → `node scripts/build-components.mjs` → `python scripts/apply-footers.py` → `python scripts/verify-local-references.py --date …` → `python scripts/dedupe-inline-masks.py` → `node scripts/file-protocol-check.mjs` → `node scripts/sidebar-toggle-check.mjs`
6. **本地预览**：`node scripts/serve.mjs`（或 `start-preview.cmd`）默认端口 4173；验收用 4174：PowerShell `$env:PORT='4174'; node scripts/serve.mjs`。
7. **在本地页面跑探测脚本**：`node --experimental-websocket scripts/local-run-cdp.mjs --page a.html,b.html --script scripts/probes/<probe>.js --sizes … [--query preview=auth] [--http] [--resize WxH --then-script p.js] [--out x.json]`（默认 file://，`--http` 用 4174）。结果会附带 console 异常。

## 3. 页面清单（146 个 HTML）

| 组 | 数量 | 页面 | 状态 |
|---|---|---|---|
| 首页/账户 | 4 | index、login、register、recovery | ✅ |
| 主栏目 | 6 | bonuses、freemoney、loyalty-program、vip-club、blog、betwave | ✅ 主页面；Blog 分类/文章、Betwave 子页 ❌ |
| Casino | 37 | casino；slots / new / 1win / bonus-buy / bonus-wagering / fishing / jili / only-1win / recommended / providers / search / search-results；casino-live + 15 个子页；casino-quick + 7 个子页；**casino-play**（新） | ✅；无限滚动 ✅ |
| Sports | 5 | sports、sports-live、sports-upcoming、sports-esports、sports-topbets | ✅ |
| Sports 筛选 | 61 | sports-live-*（16）、sports-upcoming-*（34）、sports-esports-*（11） | ✅ |
| Markets | 14 | sports-markets + 13 个分类 | ✅；Yes/No 内联下注 ✅ |
| Bet history | 1 | sports-bets-history（游客自动弹注册，与原站相同） | ✅ |
| Promotions | 2 | promotions（含详情弹窗）、promotion-halloween-2026 | ✅ |
| Tournaments | 15 | tournaments；tournament-<id> × 14 | ✅ 12 个进行中的比赛已重建；788262、817472 已结束，原站也只显示 “Back”（本地一致） |
| 尚无页面 | — | 5 个 Casino 分类、rules、trading、poker、poker-app、forum、Blog 7 个分类 + 约 21 篇文章、Betwave 12 个子页 | ❌ |

## 4. 5 步计划进度

### Step 1 Sports — ✅ 完成
Markets（+13）、TOP Bets、Bet history、61 个运动筛选页（`routes.js` 的 `sportFilters`，`common.js` 的筛选 chips）、赔率→投注单（`js/betslip-templates.js`；桌面右栏 / 手机底部 sheet；Single/Multiple；Final odds；清空；Place a bet→登录弹窗）。
未做的小项：Esports 的时间筛选与 All/Live/Upcoming 切换。

### Step 2 Tournaments / Promotions — ✅ 完成（详情页已在 Step 3 任务 C 重建）
- Tournaments 列表：All/Exclusive/From providers 筛选（`data-local-group`）+ Show more。
- Promotions：Show more；点卡片标题/图片打开详情弹窗（`js/promotions-modals.js`）。修复点：页面壳内永远有一个**空的** `[data-testid="modal-layout"]`，`common.js` 用 `openLayout()` 只认有内容的 wrapper。弹窗按钮：右上第 2 个关闭，第 1 个分享（复制链接）；CTA 按原站游客实测跳转 `PROMO_TARGETS`（证据 `captures/promo-cta-targets.json`）。1440 / 390 实测通过。

### Step 3 Casino — ✅ 完成（2026-10-15）
**小结**：A–E 全部完成并实测。无限滚动按原站的真实触发方式重写；14 个分类五尺寸 more-cards 数据齐全；12 个进行中的比赛详情页重建（Rules / 排行榜 Show all / 参与游戏 Show more）；Markets Yes/No 内联下注表单；Casino 搜索输入框聚焦与原站一致。收尾检查全部通过：146 页 0 缺失本地文件、0 主动远程引用；file:// 146 页 0 加载失败、0 console 错误；侧栏展开/收起 143 页全部 OK。

已完成：
- **游戏页** `casino-play.html`（route `/casino/play`）：点任何游戏卡 → `rememberGame()` 存 sessionStorage `1win-preview-game` → 本页替换封面和游戏名（卡片没有供应商信息，非 Majestic King 时隐藏供应商行）。Back / Log in（登录弹窗）/ Demo mode（提示）/ 分享 / 全屏都已接上。侧栏 Cockfights（`/casino/play/v_ws168:ws168`）也走这里。
- **无限滚动数据**：`scripts/build-more-cards.py` 生成 `js/<page>-more.js`（14 个会分页的分类，已在各自 html 引入），每个尺寸 `{start, step, batches}`；CSS 在 `css/local.css` 的 `[data-local-more-card][hidden]`。

**A. 无限滚动触发 — ✅**。原站实测（`captures/more-trigger-slots.json`、`more-threshold-slots.json`、`more-steps-slots.json`）推翻了旧诊断：滚动的是 document，不是 `.common-layout_sleave-*`；grid 后面有一个 0px 的空标记，它进入视口底部时加载**一页**，一页的数量等于首屏数量（1920：27，1440：24，768：21，430/390：9），标记仍在视口内就继续加载。`initMoreCards()` 改为 IntersectionObserver 观察这个标记（采集里没有就插入 `data-local-more-marker`），每次显示 `step` 张；同名不同供应商的桌台（Live Baccarat、Mines）用游戏链接去重；resize 重新渲染后保留已加载数量。验收：14 个分类 × 五尺寸（HTTP，游客）每页恰好在标记越线时加载、0 重复、无横向滚动；键盘 End、resize 通过；Demo 1440/430 通过（其它 Demo 尺寸受下面 Step 5 的 Demo 状态问题影响）。证据 `qa/casino-more-2026-10-15/`（`report.json`、`local-guest*`、`local-auth*`、`local-resize*`、`local-keys*`）。

**B. 其它尺寸的 more-cards — ✅**。`build-more-cards.py --captures captures/cap-more --date 2026-10-15` 已合并 `@rest.json`，14 个 `js/<分类>-more.js` 五尺寸齐全（`step` = 首屏数量）；与任务 A 一起在五尺寸验收，无横向滚动、无 console 错误。

**C. Tournament 详情页 — ✅**。12 个进行中的比赛用 `build-page-from-capture.py --template tournaments --captures captures/cap-tour` 重建（788264 Spinoleague、788267 Lucky Races、813699、813768、814264、814607、816330、817708、818243、819055、819462、820166；814264 的 768 已重抓）。交互数据由 `scripts/build-tournament-detail.py` 生成 `js/tournament-detail.js`（Rules 弹窗 1440/390、完整排行榜、全部参与游戏；Spinoleague 442 个游戏），`scripts/add-leaderboard-modals.py` 补 5 个比赛的排行榜弹窗；弹窗 CSS 14 条已补进 `css/audit.css`。`common.js`：Rules → 弹窗；排行榜 Show all → 弹窗（原站实测是弹窗，不是追加行）；参与游戏 Show more → 每次追加首屏数量并更新 “Games shown: N out of M”；Esc 关闭；resize 跨断点时按新尺寸重开弹窗。Rules 是原生 `<button>`（与原站相同），可聚焦，键盘 Enter 触发 click。验收 1440/768/390，游客与 Demo，证据 `qa/tournament-detail-2026-10-15/`（含 `local-rules-keyboard.json`）。
- 788262、817472 已结束：原站即使站内跳转也只显示 “Back”、正文为空（`captures/tour-open.json`、`tour-halloween.json`），不在列表的 12 张卡里；本地页面同样只有 “Back”，与原站一致，保留。

**D. Markets Yes/No 内联下注 — ✅**。`scripts/build-markets-bet-form.py` 从 `captures/markets-yes-no.json` 取出表单（1440/390、Yes/No 四份结构相同，只差结果标签，脚本会校验），关闭/减/加三个图标本地化为 mask 变量，写成 `js/markets-bet-form.js` 模板并注入 14 个 Markets 页。`common.js`：点 Yes/No → 在 CardContent 顶部插入表单，原卡片放进 `display:none` 包裹（与原站相同结构）；同时只开一个表单（开另一张卡会还原前一张）；右上 × 还原；−/+ 每次 1，0 时 − 禁用；MAX 不变（游客和 Demo 余额都是 0.00，原站游客同样不变）；输入非法内容保留上一次有效金额，失焦格式化为 “MYR 10.00”；Place a bet → 登录弹窗；resize 跨断点后按问题+方向重开并保留金额。原站行为探测：`captures/yesno-actions.json`、`yesno-formula.json`（只读，未点 Place a bet）。验收：14 页（crypto-live 除外）× 1440/390，sports-markets 与 politics 五尺寸 × 游客/Demo，file:// 与 HTTP，0 console 错误、无横向滚动，证据 `qa/markets-bet-form-2026-10-15/`。
- crypto-live 的 Up/Down 不是 Yes/No 组件：原站点击会跳到 5 分钟滚动的事件页（`captures/crypto-live-up.json`），本地按其它未采集路由处理，显示 “This page has not been captured yet.”。

**E. Casino 搜索/供应商复核 — ✅**。原站探测（`captures/casino-search-tree.json`、`casino-search-tree-430.json`、`casino-search-probe.json`）：推荐区每行 6 张（1920/1440/1024，共 3 行 18 张）、768 为 4 行 × 7、430/390 为 3 行 × 4——本地完全一致；Providers 标签 130 个入口 / 126 个 logo、文字逐字一致。唯一差异是输入框聚焦：原站在 ≥768 打开搜索层时自动聚焦，手机不聚焦。已修：`focusSearch()`，初次加载放在 `SHARED_UI.ready()` 之后（加载期间 body 是 `visibility:hidden`，聚焦会失败）。验收五尺寸 × 两页、Demo 1440/390、1440→390 resize，证据 `qa/casino-search-2026-10-15/`。

**Step 3 已知、有理由的差异**：
- Markets 的 Possible win 用 金额 ÷（百分比/100）（按本文原定公式）。原站用实时赔率（含抽水，如 15% → ×6.10 而不是 ×6.67；同为 21% 也可能 ×4.50 或 ×4.40），赔率来自第三方实时接口，本地快照只有四舍五入后的百分比，无法还原。
- `casino-live.html`、`casino-live-roulette.html` 的 file:// 检查各报 1 张 “broken” 图片：是 Greek Roulette 500x 卡上没有 `src` 的语言旗 `<img>`，原站同样没有 `src`（`captures/greek-flag.json`），属于忠实还原。
- Casino 搜索/供应商在原站是同一 URL 上的浮层切换，本地是两个独立页（`casino-search.html`、`casino-providers.html`），标签切换会换页。

### Step 4 新页面 — 采集基本完成，未生成页面
- 采集已全部完成：`captures/cap-step4/`（38 页 × 5 尺寸 = 190 份）、`captures/cap-bw/`（Betwave 12 页 × 5 尺寸）。已核对 `path`：除下面两项外都与预期一致（`/blog/vip/1win-vip%20ENG` 只是编码差异，正常）。
- ⚠️ `/poker` 和 `/forum` 游客访问会被重定向到首页（采集文件里 path 为 `/`）：不要用这两份采集建页面。先在原站探测点击侧栏 Forum / 页脚 1win Poker 的实际行为（可能是新窗口外链或需要登录），按实测做成外链提示或登录弹窗，并在本文记录。`/poker-app` 正常。
- 页面和模板建议：
  - Casino：`casino-category-100000-jackpot`、`casino-category-virtual-sports`、`casino-category-crystal-rush`、`casino-crash-games`、`casino-game-shows` → template `casino-slots`；生成后也做 more-cards。
  - `rules`、`trading`、`poker-app` → template `bonuses`；`poker`、`forum` 见上面的 ⚠️。
  - Blog：`blog-<分类>`、`blog-<分类>-<文章>` → template `blog`；确认 blog.html 里的链接能点进去。
  - Betwave：`betwave-predictions-all|express|soccer|cricket|tennis`、`betwave-events-all`、`betwave-predictors`、`betwave-create`、`betwave-rules`、`betwave-event-sample`、`betwave-prediction-sample`、`betwave-profile-sample` → template `betwave`；route 用 `/en/betwave/...`，并在 `routes.js` 加 `/betwave/...` 别名。事件/预测/个人页是动态 ID，其它 ID 的链接统一指到 sample 页。

### Step 5 资源与像素 — 部分完成
- ✅ 语言选择器 30 个国旗（原本是 `data:,` 懒加载占位）：`python scripts/fix-language-flags.py captures/language-flags.json --date …`。
- ❌ Betwave 骨架/动态图片（mikhail lazarev、Lens、Sporting CP、RB Leipzig、PSV Eindhoven）、Promotions 占位图。
- ❌ 全站五尺寸原站/本地像素对比（逐页截图、修差异、记录）。
- ❌ Demo（已登录）状态缺有效参考，**待用户本人登录原站后再采**（不要自己输入凭据）。`node scripts/auth-state-audit.mjs` 找出 27 页共 35 个 Demo 状态的布局与同尺寸游客状态不符（存的是别的尺寸的布局，如 casino-slots Demo 1920 是手机布局、Demo 390/768 是桌面布局）：betwave 390/430/768、blog 1440/1920、bonuses 390/768、casino-live-* 768（16 个）、casino-slots 1920/390/768、casino-recommended 1920/768、casino-bonus-wagering 1920、casino-fishing 768、freemoney 768、home 1920、loyalty-program 1920/768、vip-club 1920。用户登录后按尺寸重采这些路由，再用 `build-page-from-capture.py` 只更新 `-auth.js`；修完重跑 audit 应为 0。

## 5. 仍然有效的旧成果
- 共享组件：header/sidebar/footer 集中到 components，重复标记 25.36MB → 6.63MB；还原逐字节一致（`qa/shared-components-2026-10-14/`）。
- 桌面侧栏展开/收起已共享到全部页面；compact 侧栏、社交浮层、手机菜单、登录弹窗、Esc/焦点都通过（`qa/sidebar-compact-2026-10-14/`）。
- Casino 首页 10 个懒加载轮播 + Last wins + footer 已补齐；Casino 顶部 tab 组可点。
- 首页 banner 缩放修复；Betwave Read more 五尺寸；资源本地化 + file:// 检查 0 失败；mask 去重节省 68MB。

## 6. 每完成一项的检查清单
1. §2 第 5 条全部通过（无缺失本地文件、无主动远程引用、file:// 0 失败）。
2. 新页面五尺寸、游客与 `?preview=auth` 都能打开，console 无错误，无横向滚动。
3. 新交互实际点击、键盘、resize 测过。
4. 更新本文 §3、§4（完成项改 ✅，写清证据和剩余项）。
5. `captures/`（约 217MB 原始采集，可重新生成）已加入 `.gitignore`，提交前确认没有提交它。`qa/*/migration-backup/`（迁移前副本，2026-10-15 那份 322MB；`migration-report.json` 证明可逐字节还原）也已忽略，不提交。

## 7. 本轮（2026-10-15）新增/修改的文件
- 新脚本：`scripts/add-missing-css.py`、`build-more-cards.py`、`fix-language-flags.py`、`scripts/probes/*.js`；`reference-capture-cdp.mjs` 加 `via` 和 en-US 语言；`reference-run-cdp.mjs` 加 en-US。
- `js/common.js`：`openLayout()`、`PROMO_TARGETS`、promo 弹窗按钮、`rememberGame()` / `fillGamePage()`、游戏页按钮、`initMoreCards()`。
- 新页：`casino-play.html`（+ js 状态）；14 个 `js/<分类>-more.js`；`css/audit.css` 追加弹窗/游戏页 CSS；`js/dialogs.js` 国旗。
- 原始采集已从临时目录复制到项目内 `captures/`（tour、step4、betwave、more-cards、play 及三个 json 证据）。
- Step 3 收尾新增：`scripts/local-run-cdp.mjs`（本地探测）、`scripts/auth-state-audit.mjs`（Demo 状态布局核对）、`scripts/build-tournament-detail.py`、`scripts/add-leaderboard-modals.py`、`scripts/build-markets-bet-form.py`；`js/tournament-detail.js`、`js/markets-bet-form.js`；12 个 tournament 页重建；`common.js` 新增比赛弹窗/Show more、Markets 内联下注、crypto-live 提示、`focusSearch()`，重写 `initMoreCards()`；`js/dialogs.js` 恢复 `REFERENCE_SIDEBAR_ICONS` 尾部；`css/inline-masks.css` 新增 3 个 mask。
- 证据目录：`qa/casino-more-2026-10-15/`、`qa/tournament-detail-2026-10-15/`、`qa/markets-bet-form-2026-10-15/`、`qa/casino-search-2026-10-15/`、`qa/file-protocol-2026-10-15/` + `qa/file-protocol-2026-10-15-run2.txt`（146 页）+ `-step3-final.txt`（改动的 31 页）、`qa/sidebar-toggle-2026-10-15-run.txt`（143 页）。
- Step 3 已 commit（未 push）。
