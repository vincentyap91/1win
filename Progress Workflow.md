# Progress Workflow — 1win

> 2026-10-16 Figma：修复 Bet slip logo 与内容排版（只改 Figma）：
> - 保留桌面 `230:98116`、手机 `230:98344` 原 Frame ID 与位置，仍在 `30 · Menus & Modals`。没有新增重复整页。
> - 原站 `en/betting` 核实赛事卡片 1win 标志是居中的 `76×30px` 淡水印，opacity=0.04；原 SVG 导入丢失透明度及 CSS mask-size，变成约 232×91／191×76px 的黑标，已修复四处水印。
> - 两尺寸内部改为可编辑 Auto Layout：header、Single/Multiple/Series、赛事／选项／赔率、奖金进度／汇总、金额／Possible win／按钮。复用原有矢量图标与实际样式，修正文字省略和字重，奖金说明使用原站当前文案。
> - 桌面移除面板下方多余空画布：360×624；手机保留 390×844，底层面板 390×617、y=227，卡片 x=17、宽356，底部操作区 y=688、高156。奖金区与操作区重叠=0，不再贴边或遮挡 Bonus 汇总。
> - 截图核验通过：每尺寸 29 个可编辑文字、62 个 Auto Layout 容器；缺失字体=0、零高度文字=0、整页／UI 位图=0，水印均76×30、4%。原两条篮球赛事、比分和赔率保留为参考快照，原站当前赛事不同，不声称动态内容逐像素相同。
> - 机器记录保存在 Documents 工作副本 `qa/figma-betslip-fix-2026-10-16/report.json`；未改本地 HTML，未执行 Git commit／push。


> 2026-10-16 Figma 位置调整（按用户要求在 Desktop／Mobile 页面直接看到）：
> - Halloween 活动 item 弹窗移动原 Frame，不复制：桌面 `230:96125` → `10 · Desktop 1440`（页 `7:4`），位于 Promotion landing `304:16777` 右侧，坐标 33896 / 13220。
> - 手机 `230:96197` → `20 · Mobile 390`（页 `7:5`），位于 Promotion landing `304:27062` 下方，坐标 10000 / 2497.8。
> - 原节点 ID、尺寸、可编辑内容及修复效果均保留；移动前后内容指纹相同，无 Frame 重叠，新增 Frame 为 0。Menus & Modals 中不保留这两个副本，其余 18 个活动弹窗保留。此条取代下方先前记录的 Halloween 位于 all popups Section 的位置说明。


> 2026-10-16 Figma：修复用户指向 Promotion landing `304:16777` 所对应的 Halloween 活动 item 弹窗（不改网站代码）：
> - 用户链接是活动落地页，原节点保留；对应已有弹窗 `230:96125`（桌面 1440×900）／`230:96197`（手机 390×844）原位修复，不重复生成 Frame。
> - 对照原站 promotions 中的 Halloween & 500K USDT 弹窗，修正标题字距／裁切、关闭与复制按钮层级、白色正文区向封面重叠 24px 的圆角，以及手机底边遮罩。新增的两个矩形仅为可编辑内容区背景，不是整页图片。
> - 两个 Frame 保留原 ID，改名为「Promotion item popup · Halloween & 500K USDT · Desktop 1440 / Mobile 390 · Editable」，归入 `30 · Menus & Modals` 的 Section `308:33997`「Promotion details · all popups」。Section 现在包含 Halloween 及其余 9 个活动的桌面／手机版本，共 20 个 Frame。
> - 修复后已检查两尺寸截图：标题完整、两枚按钮可见、正文保留；桌面 9／手机 12 个可编辑文字，分别 2 张独立素材，缺失字体 0。未声称全站最终像素验收完成。
> - VIP Loyalty Program `222:89521`／`222:95125` 最新画布已含此前 Hero 层级与奖杯尺寸修复，本轮再次核实并保留，无重复覆盖。
> - 本轮机器记录位于 Documents 工作副本 `qa/figma-promotion-fix-2026-10-16/report.json`；未执行新的 Git commit／push。


> 2026-10-16 Figma：Promotion 弹窗 + TOP Bets（只改 Figma，未改网站代码）：
> - `30 · Menus & Modals` 新增 Section「Promotion details · all popups」`308:33997`：9 个活动弹窗（Welcome Bonus、Lucky Drive、Multiple bet bonus、Popular bets in TOP Bets、1:0 Early Payout、Up to 200,000 USDT crypto tournaments、Evoplay Crystal Rush、Rakeback poker、$20,000 GTD）× 桌面 1440 / 手机 390，共 18 个；弹窗内容完整展开（不截断滚动）。Halloween 弹窗原有 Frame 保留。
> - 这 18 个弹窗直接从原站抓取（本地弹窗缺 CSS：Multiple bet 的投注列表、Example 区块等排版不对），标题字距按原站宽度对齐，避免被截断。注意原站 Lucky Drive 内容已更新为 Lamborghini Urus SE。
> - TOP Bets 桌面 `222:92721` 原位更新：Betslip 回到顶部、去掉底部被截一半的卡片、长文字字重修正。
> - 网站待办（未处理，因本次只做 Figma）：本地 promotions 弹窗缺少部分 CSS（betting-list_*、express-bonus-modal_* 等），Multiple bet bonus 弹窗排版与原站不同。

> 2026-10-16 Figma 整理与补页（未改网站代码）：
> - 删除重复布局：Live Casino 桌面 `65:6749`、Quick games 桌面 `65:13437`（与 Casino lobby `65:2` 同一结构：横幅+本周游戏、分类按钮、多行游戏轮播、锦标赛行、SEO；直播卡已有组件 `Game card / Live desktop`）。
> - 6 个未命名 Betwave Frame 补名并归位（非重复）：桌面 Top predictors `269:22848`、Predictor profile `272:24416`、Rules `275:24416`；手机 Prediction detail `268:7078`、Top predictors `271:7078`、Predictor profile `276:7945`。
> - 补齐缺失页面设计（桌面 1440 页 `7:4` / 手机 390 页 `7:5`，共用 header/sidebar/footer/底栏组件）：Tournament detail `304:16137` / `304:26781`，Promotion landing（Halloween）`304:16777` / `304:27062`，Blog article `304:17417` / `304:27343`，Rules `304:18057` / `304:27624`，Poker app `304:18697` / `304:27905`；Betwave Rules 手机 `304:28186`（Betwave 组件）。
> - 弹窗页 `7:6` 新增 Authorization required（游客打开 Betwave 创建预测、Trading 时出现）桌面 `303:29238`、手机 `303:29281`。
> - 判定为同一布局、不另出 Frame：Blog 分类页（同 Blog）、Casino 100000 jackpot / Virtual sports（同分类网格）、Crash games / Game shows / Popular / Tournaments categories（同 Casino lobby / Slots）、运动筛选页（同 Sports live）、Betwave create / Trading / Casino trading（游客只看到 Authorization 弹窗）。

> 2026-10-16 修复（tournament 详情 + 全站图片尺寸）：
> - `css/audit.css` 中 `.detail_root-aqIuT` 的 `grid-template` 在 CSSOM 复制时被清空，详情页三栏全挤到右栏；已按原站源码补回 `"card leaderboard" "games leaderboard"`。排行榜改回 sticky（`css/local.css`）。
> - 原站 1x/2x 两个 URL 下载成同一文件，导致 `srcset="a.png, a.png 2x"`，浏览器按 2x 显示成一半大小（排行榜奖牌、会员奖杯等）。`scripts/fix-duplicate-srcset.py` 已修 185 个文件 2451 处，`capture_clean.py` 以后自动去重。
> - 对比截图工具：`scripts/shot.mjs`（本地 file:// 或原站，详情页用 `--via`）。
> - 倒计时：原本从抓取时的剩余时间重新倒数（显示 `1 : 08 : 19 : 53`，与原站不符）。`scripts/add-countdown-ends.py` 给 12 个 tournament 详情页的倒计时写入真实结束时间 `data-local-ends`（抓取时间+剩余），`js/common.js initCountdowns()` 按结束时间计算，剩余不足 1 天时隐藏天数段（同原站）。788262、817472 无正确抓取，仍按旧方式倒数。
> - 验收：tournament-816330 桌面 1440 与手机 390 全页截图与原站逐段对比一致（卡片、Rules、排行榜奖牌、游戏网格、Show more、页尾、手机底栏）；仅排行榜积分等实时数据不同。
> - VIP Loyalty Program：奖杯图在手机端只有 135×100（同一原因：srcset 重复），`css/local.css` 固定为卡片宽 268×199；Figma `222:89521` / `222:95125` 的 Hero 与等级卡图层顺序、奖杯尺寸已按原站修正。
> - 下一步：用 `scripts/shot.mjs` 逐页对比其余页面（桌面+手机），重点检查 casino / live casino 在 srcset 修复后的图片尺寸。
>
> 2026-10-16 VIP Club 对比（https://one-vv3591.com/en/vip-club，桌面 1440 + 手机 390）：
> - 中段整块空白（A personal approach、Exclusive gifts、VIP Club by the numbers、Choose how to get access）：抓取时停在“未显示”状态 `block-wrapper_hidden`。`js/common.js initReveal()` 进入视口后移除，并把 `*_cardHidden-*` 换成 `*_cardReveal-*`（同一排卡片一起出现，含手机横向滚出去的卡片）。
> - 全站 CSS：浏览器复制 CSS 时含 `var()` 的简写被清空（如 `background: var(--title-gradient)`、`grid-template`、`padding`）。新增 `scripts/fix-empty-shorthands.py`，用原站源码 CSS 恢复 46 条（`audit.css`/`styles.css`）；剩余未恢复的是 Betwave 骨架/关键帧等，不影响显示。数字滑块的渐变大字因此恢复。
> - HTML 解析：原站 `<p><div>` 是 JS 生成的，本地按 HTML 解析会把 `<p>` 提前关闭，文字掉出样式（数字说明文字看不见、Hero 副标题变细）。`scripts/fix-p-div-nesting.py` 把这类 `<p>` 改成 `<div>`（vip-club 3 个文件 150 处）。
> - 数字滑块初始状态与原站对齐：中间 $2.5M、左 $15M、右 10,000（`vip-club.html`、`js/vip-club*.js`）。
> - 验收：两种尺寸逐段截图对比，Hero、VIP manager、Concierge、A personal approach、Exclusive gifts、Numbers、Choose access、FAQ、页尾一致；桌面数字滑块两侧文字差几像素（原站滑块会自动轮播，截图时机不同）。
> - 2026-10-16 补：数字滑块与 Exclusive gifts 交互（`js/common.js initMagneticSliders()` / `initCardStacks()`），按原站实测：
>   - 数字滑块：每 3 秒前进一格（原站同），左右箭头前后一格并重新计时，点击两侧数字跳过去；状态类 current/next/farNext/hiddenBelow/hiddenAbove/farPrev/prev 由 CSS 做 0.6s 过渡；指示条位置 = 步数×(72−26)/(数量−1)。
>   - Exclusive gifts：原站不自动轮播；箭头 / 点击卡片 / 手机左右滑动切换叠卡（cardCurrent、cardNext 下沉 16px、cardSecondNext 28px），离开的卡片 0.3s 滑出，指示条同步，7 张循环。
>   - 动画核对：用 `document.getAnimations()` 对比原站与本地，标题模糊淡入、区块 2s 渐显、卡片逐张滑入、奖项无限滚动、数字滑块过渡与指示条，本地均已出现。
>   - 浏览器面板实测 1440 与 390：滚动后 4 个区块与 15 张卡片全部渐显；箭头、指示条、手机滑动正常。若看到“滚动不出现”，请 Ctrl+F5 强制刷新（旧 common.js 缓存）。
> - 2026-10-16 Figma VIP Club 补全：桌面 `222:90161`、手机 `222:95406` 原位替换内容（未新增 Frame）。之前抓取时中段区块未显示、数字是透明渐变字，现在 A personal approach、Exclusive gifts（叠卡）、VIP Club by the numbers（$15M / $2.5M / 10,000，黑→灰渐变字）、Choose how to get access 全部补齐。
>   - 管线改进：`scripts/figma/serialize.js` 支持渐变文字（background-clip:text），不再把渐变画成方块；`spec-to-svg.py` 新增 `--img-scale`（图片超过 Figma 10MB 上限时降到 1.25）；修复长文字层名被截断导致字重/字距丢失（之前所有页面中超过约 40 字的文字都会变成 Bold、字距 0）。
>   - Figma 的 Inter 没有可变光学尺寸，大字号比浏览器宽：手机标题 “Choose how to get access to” 字距调到 −1.4px 以对齐浏览器宽度 355px。
>   - 待办：其他已导入页面（Bonuses、Sports、Blog、Free money、Loyalty、Promotions、Tournaments、TOP Bets、Markets 等）也受“长文字字重丢失”影响，需要用修复后的管线重新导入替换。

## 最新操作：2026-10-16 — 按用户新指令清理重复 Figma 布局

本次用户明确要求移除重复设计 Frame，因此仅针对核实相同的 Casino 分类网格执行清理；本条取代下方历史中“所有已完成 Frame 都保留、不删除”的旧限制。其余页面、Filters 和 Figma 补全仍暂停，没有恢复上一轮实施。

- [x] 移除 7 个重复整页：桌面 1win games `65:3586`、JILI `65:5372`、New `65:15495`、Bonus wagering `82:6719`、Fishing `105:9103`；手机 Bonus wagering `94:421`、Fishing `107:805`。
- [x] 分类布局统一复用原有 Slots：桌面 `51:943`（1440×3190）、手机 `174:463`（390×1830）。不同分类的 tab 高亮、图片、人数、卡片数据和行数作为内容差异，不再生成重复整页。HTML 页面与素材不删除。
- [x] 清理后 Desktop 页保留 25 个整页，Mobile 页保留 22 个整页。所有 15 个 Betwave Frame、组件库、Menus & Modals、独立 Casino lobby／Live Casino／Quick games 均保留。
- [x] 删除前已核实目标内没有主组件；删除结果逐项返回原节点 ID，保留 Slots 原节点 ID 与尺寸。名称同为 `1win | Betwave` 的六个 Frame 实际内容不同，未删除。
- 机器记录仅存于 Documents 工作副本 `C:\Users\vince\OneDrive\Documents\ChatGPT\1win\qa\figma-dedupe-2026-10-16\report.json`。下方历史表格中的上述 7 个节点已被本次复用映射取代，勿据旧表重新导入。
- 本次只完成重复布局清理及进度记录；其余页面／状态补全和原站最终视觉验收仍未完成。没有新执行 Git commit 或 push。


## 当前停止点：2026-10-15（用户要求停止全部工作）

**现在暂停所有页面、Filters 和 Figma 实施。仅完成本次进度记录、Git commit 和 push；下次用户在本聊天发出继续指令后再恢复。不要自动继续。全站及 Betwave 最终视觉验收均未完成，不能报告 100%。**

### 实际项目与同步规则

- **唯一实际交付／Git 仓库：** `C:\Users\vince\OneDrive\Desktop\website\1win`；分支 `main`，远端 `origin` 为 `https://github.com/vincentyap91/1win.git`。
- 当前 Codex 工作目录 `C:\Users\vince\OneDrive\Documents\ChatGPT\1win` 是较旧的局部工作副本，本身没有 Git。实际 Desktop 中已有 55 个 Betwave HTML 入口及更多全站页面，不能用旧副本整目录覆盖。
- Desktop 的 `js/common.js`、`js/routes.js`、`js/dialogs.js` 和其他已完成页面存在额外更新，必须保留。恢复时先读实际仓库状态与本文，再合并指定文件。
- 两份必读文档仍只有 `Design Rule.md` 和本文；本轮详细机器状态暂存于工作副本 `C:\Users\vince\OneDrive\Documents\ChatGPT\1win\qa\betwave-2026-10-15\current-state.json`，尚未同步到 Desktop 仓库。

### 本轮已完成（包含验收边界）

- [x] 按原站公开游客 UI 调查并保存 40 个 Betwave 尺寸／状态参考：首页、预测列表、赛事列表／详情、单场／串关预测、排行榜、作者财务／利润／订阅者／评论、规则、分享／排序／日期／筛选／授权／手机菜单等。公开数字为参考快照，不接生产后台。
- [x] 新版 `betwave.html` 使用一个入口及查询参数提供内页；`js/betwave-data.js` 集中保存状态与共享片段，`js/betwave-runtime.js` 负责本地交互，`css/betwave.css` 与 `css/betwave-local.css` 分离原视觉样式和本地容器调整。旧的已完成入口全部保留。
- [x] 修复用户打开 Desktop 版本仍为空的问题：已同步新版入口、数据、交互代码、样式和素材，并保留真正的首页初始 HTML，避免脚本延迟时出现空白 body。
- [x] 修复 `file:///` SVG 图标问题：构建内嵌 588 处蒙版引用，缺失蒙版文件 0；共享加载器补充现有入口的 SVG 蒙版处理，不要求关闭浏览器安全设置。浏览器自动化不支持直接打开 file://，因此此项的证据为静态引用检查与实际交付目录 HTTP 预览；不能写成所有 file:// 页面已逐页视觉验收。
- [x] 修复预测列表 Top predictors 下方 Rewarding authors 空占位：首页与预测列表复用完整桌面／手机横幅，含原图、标题、100k $、20 位作者、头像和两个按钮。原站赛事列表本身没有此横幅，不凭空添加。
- [x] `js/betwave-components.js` 已接入实际交付目录现有 **55 个 Betwave HTML**，统一处理缺失横幅、筛选默认值与 file:// 图标；没有删除原有子页面。55 个入口同步哈希差异 0，证据 `shared-delivery-build.json`、`delivery-sync-verified.json`。
- [x] 补回原生 input.value 未进入外层 HTML 而遗漏的默认值：赔率 `1.01 / 151`、胜率 `0 / 100`；Figma 桌面 Filters 也原位补上四个可编辑数值。原站桌面筛选容器宽 344px、外层 padding 16px、内部组间距 8px 已实测对照，仍不等于全状态视觉验收通过。
- [x] 修复空的 modal teleport 被旧公共交互误认为已打开弹窗的问题；Betwave 手机菜单使用原站观察到的内容，未复制生产脚本。
- [x] **资源约束：** 不引入 gtag、GTM、广告投放、统计 SDK、追踪像素、会话录制等。交付只保留视觉资源与本地交互；Figma SDK 只在隔离 QA 预览中使用，不进入交付 HTML。
- [x] 原站 1440px 首页与同状态本地首屏截图曾比较为 0 差异像素；只证明该次 HTML 首屏参考，不证明手机、Figma、整页或全状态已通过。早期手机截图存在字体未稳定及截图被截短的问题，不能把旧手机 diff 报告当作最终通过证据。

### Figma 实际状态（禁止重复捕获已有整页）

文件：[1win](https://www.figma.com/design/OmnjmGzEsH8UcsGk8uJJkk/1win)。本轮新增 **15 个不同尺寸／布局的可编辑原生整页：8 个桌面、7 个手机**，所有历史已完成 Frame 与其他页面工作均保留。

| 布局族 | Desktop 1440 | Mobile 390 | 停止时状态 |
| --- | --- | --- | --- |
| Home | `236:21506` | `238:5950` | 已整理位置并组件化主要区域；桌面 Top predictors 仍需统一组件与最终 QA |
| Prediction feed | `239:21506` | `242:5950` | 已组件化主要区域、修复横幅与筛选默认值；Filters 最终视觉／交互 QA 未完成 |
| Events | `243:21506` | `247:5950` | 已接共享头部、侧栏／底栏、Top predictors 与页尾；最终 QA 未完成 |
| Event detail | `246:21506` | `250:5950` | 已导入可编辑图层；组件化与 QA 待做 |
| Prediction detail | `251:21506` | `268:7078` | 已导入；桌面已命名排列，手机仍为原始导入名，待整理／组件化／QA |
| Predictors | `269:22848` | `271:7078` | 原始可编辑导入；待命名排列、组件化、QA |
| Author profile | `272:24416` | `276:7945` | 原始可编辑导入；待命名排列、组件化、QA |
| Rules | `275:24416` | **未导入** | 桌面原始可编辑导入；手机待做，已有原站 390 参考 |

- 共享组件账本当前 23 项。Rewarding authors 变体集 `263:2112`，桌面主组件 `263:1883`、手机主组件 `263:1934`；已在首页／预测列表原位使用，独立素材与文字可编辑，非整页图片。预览 `figma-reward-component.png`。
- 首页与预测列表卡片、导航、页尾及 Events 主要区域的组件替换几何检查通过，最新记录最大位置／尺寸偏差为 0；这不是逐像素最终验收。
- 新建桌面首页组件曾出现原生蒙版后代映射问题，已重建侧栏实例 `256:22762`、页尾实例 `256:23120`，卡片 `253:1363` 高度修正为 362px。首份 `figma-state.json` 的历史 issues 已过时；恢复时以 `current-state.json` 及最新画布为准。
- 有六个后期导入 Frame 尚叫 `1win | Betwave`，只应在原节点命名／整理，不再重新捕获同页。未提交的捕获 ID 不保留为恢复凭据，下次仅为真正尚缺的设计申请新 ID。

### 未完成与下次恢复顺序

1. 用户明确发出继续指令后，先读取本节、`current-state.json`、实际 Desktop Git 状态并核实 Figma 节点；不要恢复旧 Casino 任务，不删除任何已完成 Frame。
2. 继续 Filters 对照：桌面与手机内边距／外间距、默认值、checkbox、折叠、排序／日期弹层、Apply／Reset 及键盘状态；当前只完成默认值、部分几何和基础本地交互，不能标为全部完成。
3. 整理既有六个原始导入 Frame，在已有 Event detail／Prediction detail／Predictors／Profile／Rules 桌面内继续组件化与视觉 QA；补唯一缺失的 Rules 手机整页。
4. Betwave 的独立菜单／弹窗／下拉设计尚未放进 Figma Menus & Modals：已有 8 类本地面板数据，但不能把源参考或本地 HTML 当作已导入。补手机 Filters、手机菜单、分享、排序、日期、游客 Authorization；既有登录／注册／恢复继续复用。
5. 资料页 Profit／Subscribers／Comments、首页订阅空状态、串关详情等使用独立内容状态或组件变体复用已有布局，不再新增重复背景整页；相应原站参考和本地状态已有，Figma 面板与原型连线待做。
6. 完成 1440／390 最终原站 ↔ 实际交付目录 HTML ↔ Figma 视觉对照；再检查 1920／768／430、中间宽度及 file://。当前 768／430 主要沿用响应式结构，未完成对应精确观察与全状态验收。其他作者／赛事链接使用参考布局与样本内容，不能声称实时数据或所有记录已实现。
7. 继续全站尚缺状态／页面及最终验收，按此前布局复用原则推进；不以历史的 31 个入口或固定百分比作为当前全站完成分母。

### 维护与交付证据

**停止时文件位置：以下本轮新增构建脚本和 `qa/betwave-2026-10-15/` 证据目前仅保存在 Documents 工作副本，不在本次 Desktop 仓库提交中。自动审批拒绝了超出“仅更新进度与 Git”范围的额外批量同步，未执行该同步。恢复时先核实文件位置；只有用户恢复相关工作后才审核、同步所需脚本和证据。前文所述 HTML、共享加载器、样式和素材已在此前同步至 Desktop。**

- 本轮构建：`scripts/build-betwave.py`、`scripts/fetch-betwave-assets.py`、`scripts/build-betwave-shared.py`、`scripts/betwave-shared-runtime.js`。
- 构建次序：先 `build-betwave.py`，再 `build-betwave-shared.py`；后者为实际 Desktop 现有入口生成带同一共享加载器的补丁，须审核后同步，不能用旧全局脚本覆盖真实仓库。
- 原站资源清单已改为项目内相对路径，398 条资源引用已持久化，避免下次依赖浏览器临时导出目录。
- 源参考、静态素材、构建报告、共享入口清单、Figma 节点、图标与截图证据集中在 `qa/betwave-2026-10-15/`。`before/` 与 `delivery-patches/` 是本机备份／可再生补丁，不是必读文档。
- 本次 Git 提交和推送仅保存停止点；不代表页面、Filters、Figma 或原站最终视觉验收全部完成。

---

## 此前进度记录（保留）

### 2026-10-15：Figma 补齐其余独立页面（不重复 layout）

- 新增 12 个独立 layout，桌面 1440（页 `7:4`）与手机 390（页 `7:5`）各一份，共 24 个 Frame：Bonuses、Sports、Sports live、Markets、TOP Bets、Blog、Free money、Loyalty program、VIP club、Promotions、Tournaments、Casino game。头部/侧栏/页尾/手机底栏全部用现有组件实例（`28:65`、`28:403`、`28:640`、`38:280`、`38:486`、`38:543`），内容为可编辑文字（Inter 字重与字距已还原）、矢量与图片。
- `30 · Menus & Modals`（`7:6`）新增 4 组状态（各桌面+手机）：Promotion details、Language picker、Casino search · Games、Bet slip · 2 selections。
- 未新增重复 layout：Upcoming / Esports 与运动筛选页复用 Sports live；Bonus buy、Only on 1win、AI 推荐、Live/Quick 子类复用现有类别网格；Providers/Search 结果复用搜索面板；登录/注册/恢复复用 Auth 组件。TOP Bets、Markets 只保留首屏若干行（同一卡片不重复几百次）。Betwave 按要求跳过。原有 Frame 全部保留未改。
- 方法：本地页面 DOM → SVG（`scripts/figma/serialize.js`、`spec-to-svg.py`）→ Figma 导入 → 组合（`scripts/figma/compose.js`）；节点账本 `qa/figma-editable-2026-10-14/state.json`。原站最终视觉验收仍待做。



更新：2026-10-15，Asia/Kuala_Lumpur。只读本文确认进度；设计维护规则只查 **Design Rule.md**。详细节点／机器证据在 QA JSON，不新增必读 Markdown。

**最新用户纠正：已完成设计全部保留；不再删除或合并现有 Frame，仅避免后续新增相同布局整页。中断期间生效的合并已通过 Figma 原生历史版本完整恢复：7 个分类整页与原节点 ID 全部找回，重新核实为 10 个桌面、5 个手机页面。证据：`preserve-existing-restore-audit.json`。接下来只继续独特页面／弹窗及原站最终验收。**

## 当前任务与验收边界

用户已停止 Casino HTML 审核，当前任务是把全站游客设计放入 [1win Figma](https://www.figma.com/design/OmnjmGzEsH8UcsGk8uJJkk/1win)，供设计师编辑。范围：桌面 1440px＋手机 390px，菜单、筛选和弹窗；不以现有 31 个 HTML 作为原站完整分母。

**全站尚未完成，不能报告 100% 或可靠完成百分比。** 当前保留 10 个不同桌面页面、5 个不同手机页面；所有页面仍需按原站最终状态验收。相同路由／尺寸／实质状态只保留一个整页 Frame；此前清理的 11 个重复参考没有恢复。

## 已完成的本轮设计工作

- [x] 建立 Figma Design System、共享组件、Overview 和交接索引；原生文字／矢量／布局可编辑，封面和横幅保持独立素材，没有整页截图充当设计。
- [x] 首页桌面／手机共享组件化，保留原 Frame；与迁移前本地捕获的变化像素约 0.070%／0.067%，只代表迁移保真。
- [x] Bonus wagering 桌面 `82:6719`、手机 `94:421` 补齐公共页尾与版权；分别 24／9 张卡片，27／12 个实例，空白页尾已修复。
- [x] Fishing 桌面／手机首次迁移；JILI、New 在原 Frame 补公共页尾。Casino、Live、New 已有网格卡片接回共享实例。
- [x] Casino lobby 桌面／手机补上六个缺失分类：Bonus buy、Bonus wagering、Jili Games、New、Only on 1win、Quick games；分别 54／24 张新增卡片。分类位置来自保存的原站证据，图标为原 SVG 矢量。
- [x] Casino lobby 两尺寸补上原生 Last wins；手机每周游戏补成共享组件。桌面 1440×5559、手机 390×5280；图片元数据错误 0、缺失字体 0、整页位图 0。动态公开获奖／人数数据使用参考快照，不代表实时相同。
- [x] Slots 在原 `51:943` 内由旧 1536 布局改为 1440×3190，72 张卡片、76 个组件实例，6 张原本没有人数的卡片保留隐藏状态。卡片边界与 1440 捕获坐标最大偏差不足 0.001px；227 个文字、132 个矢量、90 个独立图片图层，图片错误／缺失字体／整页位图均为 0。
- [x] 收起侧栏和 Providers 面板迁成独立可编辑组件；Providers 原站最终样式仍待确认，不计为状态最终验收。
- [x] Quick games 原 `65:13437` 补齐 Mines／Plinko／Sport／Lotteries 四分类、底部 24 卡片、Last wins、加载更多及共享页尾；同时修复旧导入的 27 张空白卡片、横幅、活动图和侧栏素材。现在为 1440×4549、87 张游戏卡片、97 个组件实例；卡片边界与原站实测最大偏差 0.00087px。113 个图片图层的元数据错误 0、缺失字体 0、整页位图 0；97 个临时素材节点已清理。同名 Mines／Plinko 按素材地址区分，不按名称替换。
- [x] 核实没有手机 Slots 后，只新增唯一 `174:463`（390×1830）；首批 9 张卡片、13 个组件实例，共享桌面／手机分类头部变体集 `174:462`，原桌面主组件 `143:615` 保留。原站实测卡片边界最大偏差约 0.00235px；20 个图片图层均可渲染，缺失字体／整页位图为 0。当前预览 `slots-mobile-current.png` 已视觉检查。
- [x] 原站游客登录／注册／恢复弹窗新增 9 个可编辑状态，组成三个组件变体集；集中展示在 Menus & Modals 的 `202:955`，没有复制背景整页。桌面：手机／邮箱登录、手机／邮箱恢复、注册默认／优惠码展开；手机：登录、注册、恢复三个 390×820 底部弹层（390×844 窗口）。输入框复用组件并暴露 Label／Hint／Country code／Number placeholder 属性。原生检查：缺失字体 0、越出弹窗的文字 0、整页位图 0；测量几何最大偏差 1px，此项不等于逐像素验收通过。证据：`auth-state-index.json`、`auth-states-current.png`。
- [x] 再次核实已有 10 个桌面、5 个手机整页与原节点 ID 全部保留；本轮只新增弹窗设计。

## 唯一页面索引（保持节点 ID）

| 页面 | Desktop 1440 | Mobile 390 | 当前边界 |
| --- | --- | --- | --- |
| Home | `24:2` | `37:2` | 已组件化；原站最终 QA 待完成 |
| Casino lobby | `65:2` | `129:1189` | 已补六分类、每周游戏和 Last wins；全状态 QA 待完成 |
| Slots | `51:943` | `174:463` | 桌面 72 卡片、手机首批 9 卡片；原站最终 QA、手机自动追加状态待完成 |
| 1win games | `65:3586` | 待做 | 已组件化；原站最终 QA 待完成 |
| Fishing | `105:9103` | `107:805` | 24／9 卡片与公共页尾；原站最终 QA 待完成 |
| JILI | `65:5372` | 待做 | 已补公共页尾；原站最终 QA 待完成 |
| New | `65:15495` | 待做 | 已补公共页尾；原站最终 QA 待完成 |
| Live Casino | `65:6749` | 待做 | 已组件化；次分类与全页 QA 待完成 |
| Quick games | `65:13437` | 待做 | 桌面缺失区及旧缺图已修复；87 卡片通过几何核对，动态内容／交互最终 QA 待完成 |
| Bonus wagering | `82:6719` | `94:421` | 空白页尾已修复；原站最终 QA 待完成 |

## 未完成与接续顺序

1. 按布局族核对尚缺的手机 Casino 覆盖，优先 Live Casino／Quick games 的独特布局。1win games／JILI／New 等若与现有网格布局相同，记录复用映射与内容状态，不新增整页；已有完成版本仍全部保留。
2. 调查尚缺 Casino 分类及状态；Bonus buy、Only on 1win、Recommended 等先确认结构差异，相同布局复用现有设计。Quick、Slots 的动态内容／交互和原站最终 QA 仍待完成。
3. 继续 Sports、Betwave、Free money、Bonuses、会员／VIP、Promotions、Tournaments、Blog 等独特页面及已发现但未实现路由；先调查原站，不凭本地快照补造。
4. 搜索、结果、Providers／筛选、移动菜单等使用独立状态组件。登录／注册／恢复已新增 9 个状态；手机邮箱登录／恢复、手机优惠码展开、国家／币种选择、错误／加载／键盘状态和原型连线仍待观察补齐。
5. 按原站同窗口／状态逐页比较、修复、实际操作，再完成最终设计师交接。轮播、人数、倒计时、feed 的动态差异单独记录。

手机 Slots 滚到底部会自动连续追加游戏行，本轮观察到从 9 追加至 306；因此使用一份首批网格基础设计，重复网格作为共享组件状态，不为每批数据再建整页。连续追加一度使原站浏览器截图／关闭请求超时；已恢复默认窗口尺寸并成功关闭三个临时研究标签。原站完整截图对照仍未通过；不要以原生图层和几何检查代替最终逐像素验收。新增整页捕获参考曾因重复风险被自动审批拒绝，已改为先核实唯一性、直接使用共享组件构建唯一手机页面，没有绕过拒绝执行捕获。

共享组件入口在 Figma 的 **02 · Components**；当前模块与规则见 Design Rule。账本：`qa/figma-editable-2026-10-14/state.json`。最新验证：`casino-native-audit-desktop.json`、`casino-native-audit-mobile.json`、`slots-1440-native-audit.json`、`slots-1440-geometry-audit.json`、`quick-native-audit.json`、`slots-mobile-native-audit.json`；当前截图使用 `casino-desktop-current.png`、`casino-mobile-current.png`、`slots-1440-current.png`、`quick-desktop-current.png`、`slots-mobile-current.png`，不要使用修复前中间截图。

## HTML 历史基线（已停止，不是当前执行任务）

以下保留 HTML 项目交接证据与尚未验收范围。用户已改为先完成可编辑 Figma；不自动继续旧 HTML 审核或应用旧 Casino 修补脚本。

## 当前结论

目标仍是 https://one-vv3591.com/ 全页面视觉和已观察前端行为最终 100% 一致。**现在没有达到全站 100%，也没有可靠的完成百分比。** 当前有 31 个 HTML、28 个内容入口、游客／Demo 各五尺寸共 280 份状态；原站还存在未完整调查或实现的页面和状态。

本轮公共组件迁移已完成：31 个入口 × 桌面游客／桌面 Demo／390px 游客共 93 次浏览器启动检查，全部可显示、未留下组件占位、没有新增横向溢出。8 组重构前后布局指标一致；顶部区域及 4 组桌面侧栏像素差异为 0。完整截图中 3 组完全一致，其余有少量内容区差异，未把它们计为逐像素通过。

实际交付目录 C:\Users\vince\OneDrive\Desktop\website\1win 已同步 239 个变更文件并逐文件核对，哈希差异 0；已从该目录启动，自动构建 142 个模板成功，首页及 Betwave 展开正常。同步与交付启动证据见 sync-report.json、delivery-smoke.json。

## 已完成并明确验证的工作

| 工作 | 结果与验收边界 | 证据 |
| --- | --- | --- |
| 两份交接文档 | Design Rule 含实测设计系统、共享组件和运行规则；本文含完成／未完成、页面清单、接续顺序 | 本文及 Design Rule.md |
| 公共 shell 抽取 | 731 处 header / sidebar / footer 引用集中到 142 个精确保留变体；重复标记约 25.36MB 降至 6.63MB | qa/shared-components-2026-10-14/migration-report.json |
| 还原与可重复构建 | 314 份状态／入口片段逐字节还原一致；91 个源文件重复迁移没有改变 | migration-report.json、idempotence-check.json |
| 公共交互回归 | 侧栏反复展开／收起、社交浮层及 Esc、登录弹窗显示、手机菜单及 Esc 均通过；手机菜单 280×844 与原站一致；修复侧栏重建后社交标签丢失 | shared-functional-qa.json |
| Betwave Read more | 五尺寸游客展开／收起、原站文字与箭头匹配；展开内容高 100 / 120 / 160 / 300 / 320px（1920 / 1440 / 768 / 430 / 390）；跨窗口保留状态和焦点 | betwave-seo-five-viewports.json、betwave-read-more-430.png |
| Betwave 430 FAQ | 第一项展开高度 148px、其余收起行高与原站一致；本地七项键盘展开可用。其余六项原站展开尚需重测，自动滚动点击两次误跳详情页，未计为通过 | betwave-reference-430.json、betwave-local-430.json、betwave-faq-430-partial.json |
| 原站设计采样 | 实测颜色、字体、控件和断点已写设计规则 | reference-design-tokens.json、reference-component-specs.json |
| 首页 banner | 修复 slide 被 scaler 二次缩放；五尺寸 guest/auth、连续缩放和五张桌面切换通过；auth 1920 原站布局仍需新参考 | qa/resume-2026-10-14/home-banner-* |
| 首页 compact 侧栏 | 修复过渡态社交按钮、错误 Casino 高亮和底部间距；四组窗口侧栏区域像素差异 0 | qa/sidebar-compact-2026-10-14/pixel-comparison-* |
| compact 社交浮层 | 打开／关闭、Esc、Enter、焦点、外部点击和滚动到最后一项通过；不透明主体一致，透明边缘受不同 banner 影响 | social-functional-checks.json、pixel-comparison-social.json |
| 本地资源 | 字体、mask 及原站图片本地化；缺失本地文件和主动远程引用检查通过，data:, 缺素材另记 | qa/expanded-static-qa.json |
| Betwave FAQ 部分范围 | 1920/1440 guest 与 Demo、768/390 guest 的内容与布局指标一致；多项开关、键盘、1440→768 焦点保持通过 | qa/resume-2026-10-14/faq-* |
| 既有界面 | Casino 类别、搜索／供应商、Sports、活动／会员、账户展示与动画已有实现和历史检查；不视为全状态最终完成 | qa/final-page-audit.json 等历史证据，仅按最新同组合结果评估 |

## 已实现但尚未完整验收／补齐

| 优先级 | 项目 | 具体剩余事项 | 下一步验收条件 |
| --- | --- | --- | --- |
| P0 | Betwave Demo 响应式 | 768 有 16 项旧指标差异；390 保存了桌面侧栏；430 和其余 Demo 手机未验收 | 有效 auth 参考或明确标注 Demo 推导范围；修复后五尺寸及 FAQ 全验收 |
| P0 | auth 1920 首页 | 现有状态含 343×165 设计画布，仅确认铺宽 | 重新核对原站该状态的整体布局，不沿用 guest 结论 |
| P0 | 缺失／不完整 footer | 一些 auth 捕获没有 footer，公共组件不会补造 | 逐页滚到最后确认参考内容及加载完成，再补状态和共享模板 |
| P1 | Betwave 5 张旧动态图片 | mikhail lazarev、Lens、Sporting CP、RB Leipzig、PSV Eindhoven | 对应人物／队伍资源，或重新捕获一致的 feed；不拿其他图片替换 |
| P1 | Betwave 430 FAQ 余项 | 其余六项原站展开状态尚未稳定重测，自动滚动点击误跳详情 | 在实际可见位置稳定点击，按每项答案、展开高度和截图核对 |
| P1 | Casino 次级行为 | Live Casino 16 个次级类别、供应商列表、手机搜索、筛选与详情 | 每个重要状态先观察、再实现、再截图和实际操作 |
| P1 | Sports | 体育筛选、赛事详情、投注单本地展示、次级列表和手机交互 | 对照真实 UI；真实投注不提交 |
| P1 | 活动与内容 | Tournaments 筛选／Show more、活动详情、FAQ／币种／地区等 | 补完整可观察状态和路由 |
| P1 | 全高度视觉差异 | 所有入口／状态五尺寸还没有逐项像素证明 | 逐页原站／本地对齐截图，修复，再更新此表 |
| P2 | 完整运动模式 | 系统减少动态效果下已实际测试；完整位移只有调度检查 | 不改变用户系统偏好，在允许完整运动的环境实际观察 |
| P2 | file:// | 相对资源、字体、mask 已处理；工具拒绝该协议，真实双击视觉未证实 | 可正常访问的实际浏览器验收，不以 HTTP 代替 |
| P2 | 可移植再采集 | 旧整合输入仍引用外部 audit-staging / 1win-clone | 整理参考与素材输入，不依赖旧 Vincent 临时路径 |
| P2 | 打包 | 目录外旧 ZIP 不含最新修改 | 必要验收后重新打包，不把旧 ZIP 当最新版 |

当前 Chrome 与内置参考均为未登录；本轮没有输入凭据、改账户、支付或投注。登录后独有布局暂缺有效新参考，保持待验收；继续推进公开页面和维护工作。

## 页面清单与已发现缺口

下表是本地入口清单，不是原站全站页面总数。M 表示已有实现；V 表示仍待全状态视觉验收；F 表示仍有功能／内容缺口。具体当前阻碍见上表。公开游戏启动、真实账户和生产交易接口不在本地接入。

| 原站路径／状态 | 本地入口 | 当前状态 |
| --- | --- | --- |
| /betwave, /en/betwave | betwave.html | M；V / F 待逐状态完成 |
| /blog | blog.html | M；V / F 待逐状态完成 |
| /bonuses | bonuses.html | M；V / F 待逐状态完成 |
| /casino/1win-games | casino-1win.html | M；V / F 待逐状态完成 |
| /casino/bonus-buy | casino-bonus-buy.html | M；V / F 待逐状态完成 |
| /casino/bonus-wagering | casino-bonus-wagering.html | M；V / F 待逐状态完成 |
| /casino/fishing-games | casino-fishing.html | M；V / F 待逐状态完成 |
| /casino/jili-games | casino-jili.html | M；V / F 待逐状态完成 |
| /casino/live-games | casino-live.html | M；V / F 待逐状态完成 |
| /casino/new | casino-new.html | M；V / F 待逐状态完成 |
| /casino/only-on-1win | casino-only-1win.html | M；V / F 待逐状态完成 |
| /casino 的 Providers 浮层 | casino-providers.html | M；V / F 待逐状态完成 |
| /casino/fast-games | casino-quick.html | M；V / F 待逐状态完成 |
| /casino/ai-recommendations | casino-recommended.html | M；V / F 待逐状态完成 |
| /casino 的搜索结果浮层 | casino-search-results.html | M；V / F 待逐状态完成 |
| /casino 的搜索浮层 | casino-search.html | M；V / F 待逐状态完成 |
| /casino/slots | casino-slots.html | M；V / F 待逐状态完成 |
| /casino | casino.html | M；V / F 待逐状态完成 |
| /freemoney, /about-token | freemoney.html | M；V / F 待逐状态完成 |
| / | index.html | M；V / F 待逐状态完成 |
| 登录入口／弹窗 | login.html | M；V / F 待逐状态完成 |
| /loyalty-program | loyalty-program.html | M；V / F 待逐状态完成 |
| /promotions | promotions.html | M；V / F 待逐状态完成 |
| 密码恢复入口／弹窗 | recovery.html | M；V / F 待逐状态完成 |
| 注册入口／弹窗 | register.html | M；V / F 待逐状态完成 |
| /betting/esport | sports-esports.html | M；V / F 待逐状态完成 |
| /betting/live | sports-live.html | M；V / F 待逐状态完成 |
| /betting/prematch | sports-upcoming.html | M；V / F 待逐状态完成 |
| /betting | sports.html | M；V / F 待逐状态完成 |
| /tournaments | tournaments.html | M；V / F 待逐状态完成 |
| /vip-club | vip-club.html | M；V / F 待逐状态完成 |

已发现但尚未完整实现的范围：Markets、Forum、Cockfights、Trading、Poker；Betwave predictions / events / predictors / rules / detail；Casino provider / game detail；Sports event detail；Promotion / Tournament detail。还有可能存在未发现路由。先扩充调查清单，再定义验收分母，不把这些静默遗漏。

## 每次开工只按这个顺序

1. 读本文的当前结论和最高优先项；Design Rule.md 只查本次相关规则。
2. 启动 start-preview.cmd 或 `node scripts/serve.mjs`，确认预览可用。
3. 为本次页面／状态明确 URL、guest/auth、窗口、滚动与交互，保存原站证据。无法访问就记录条件，不造页面。
4. 同一组件改 components/*.html／共享 CSS／common.js；页面专属内容改相应状态。原始重新采集后迁移一次；编辑共享模板后构建一次。
5. 先检查构建和资源引用，再做同条件截图、实际点击、键盘、滚动、resize、console。当前项通过后进入下一项。
6. 只更新本文：完成项、证据、仍欠范围、下一个精确动作；设计规则改变才更新 Design Rule.md。旧结果被新结果取代时注明，不堆重复历史。
7. 同步实际交付目录，保存修改前备份；停止自己的预览服务、恢复临时尺寸和关闭自建标签。

## 下一项精确动作

共享组件和公开 Betwave Read more 五尺寸已通过。下一次先稳定原站滚动位置后，重测 Betwave 430 的其余六项 FAQ 展开状态（此前自动滚动点击误跳详情，不能沿用该结果）。随后逐页调查缺失 footer，再做 Casino 16 个次级筛选／详情。Demo 独有布局等待有效参考，不能写成已通过。

## 证据怎么读

- shared-components-2026-10-14：本轮重构／原站设计采样／后续审查。迁移保真不等同原站保真。
- sidebar-compact-2026-10-14：已通过的 desktop compact 和浮层状态。
- resume-2026-10-14：banner 修复、部分 Betwave FAQ 和明确失败／未覆盖项。
- final-page-audit 等旧报告：历史版本，按最新同“文件／preview／尺寸”结果读取。旧统计不能升级为全站验收。

截图差异图、资产表和机器报告保持 JSON／PNG，不要求接手者把所有文件读一遍。目录外旧 ZIP 及 reference/legacy-docs 仅用于追溯；当前两份根文档和现有代码才是交接依据。

---

# HTML 克隆进度 — 1win（Step 1–5，接续 Step 3 提交版）

最新版本：**2026-10-16**（Asia/Kuala_Lumpur）。本节是接手 agent（Cursor 等）的唯一进度依据；设计/代码规则查 **Design Rule.md**。本文件顶部的 Figma 段落属于另一条工作线，不要改它。

---

## 0. 一分钟了解项目

- **目标**：用 HTML5 + CSS + 原生 JS 1:1 克隆 https://one-vv3591.com/（设计 + 前端行为）。游客 + Demo（已登录展示）两种状态；五个尺寸 1920×1080 / 1440×900 / 768×1024 / 430×932 / 390×844。直接双击 HTML（file://）也要显示图标和图片。
- **用户规则**：全部自己完成，不要问用户；只做本地展示，不接真实账户/支付/投注；不输入任何凭据；Demo 数据脱敏（姓名→Demo user，ID→ID 00000000，余额→0.00）。
- **当前阶段**：5 步缺口计划已完成 Step 1–4（Step 4 按用户要求跳过剩余 Betwave 动态图）；**Step 5 进行中**（见 §4）。2026-10-16 已用本人登录的 Chrome 对照全部已注册页面的 Demo 顶栏：265 个页面 × 1440 / 390，余额、通知、底栏与原站一致。唯一差过的 `betwave.html` 已补上登录顶栏（余额 0.00）。35 个放错尺寸的 Demo 状态已改回同尺寸布局，`auth-state-audit` 为 0。仍缺逐像素全站对比、筛选子页抽检、Betwave 动态图。
- **规模**：271 个 HTML 入口（见 §3）。

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

## 3. 页面清单（271 个 HTML）

| 组 | 数量 | 页面 | 状态 |
|---|---|---|---|
| 首页/账户 | 4 | index、login、register、recovery | ✅ |
| 主栏目 | 6 | bonuses、freemoney、loyalty-program、vip-club、blog、betwave | ✅ |
| 其它栏目（Step 4） | 3 | rules、trading、poker-app | ✅ |
| Blog（Step 4） | 58 | 7 个分类 + 51 篇文章（`blog-<分类>-<文章>`） | ✅ |
| Betwave 子页（Step 4） | 54 | predictions 全部/express/各运动、events 全部/各运动、predictors、create、rules、event/prediction/profile 样例 | ✅（`padel` 按用户要求跳过，见 Step 4） |
| Casino | 47 | casino；slots / new / 1win / bonus-buy / bonus-wagering / fishing / jili / only-1win / recommended / providers / search / search-results / play；casino-live + 15 个子页；casino-quick + 8 个子页（含 popular-turbo-games）；Step 4 新增 100000-jackpot、virtual-sports、crystal-rush、crash-games、game-shows、popular、trading、tournaments-categories | ✅；无限滚动 ✅ |
| Sports | 5 | sports、sports-live、sports-upcoming、sports-esports、sports-topbets | ✅ |
| Sports 筛选 | 62 | sports-live-*（16）、sports-upcoming-*（34）、sports-esports-*（12，含 call-of-duty） | ✅ |
| Markets | 14 | sports-markets + 13 个分类 | ✅；Yes/No 内联下注 ✅ |
| Bet history | 1 | sports-bets-history（游客自动弹注册，与原站相同） | ✅ |
| Promotions | 2 | promotions（含详情弹窗）、promotion-halloween-2026 | ✅ |
| Tournaments | 15 | tournaments；tournament-<id> × 14 | ✅ 12 个进行中的比赛已重建；788262、817472 已结束，原站也只显示 “Back”（本地一致） |
| 不建页面（按原站行为处理） | — | `/forum`（外部论坛站提示）、`/poker`（→ 首页）、比赛联赛页 `/betting/<栏目>/<运动>/<联赛>`（实时赛程提示）、游戏 `/casino/play/*`（→ casino-play） | ✅ 见 Step 4 |

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

### Step 4 新页面 — ✅ 完成（2026-10-15；剩余 Betwave 工作按用户要求跳过）
**小结**：新增 125 个页面（146 → 271），全部五尺寸游客 + Demo 状态。站内导航可达的路由除 1 个被跳过的 Betwave 页外全部有本地页面或按原站行为处理（`node scripts/unresolved-links.mjs` 只剩 `/en/betwave/events/padel`）。收尾检查全部通过：271 页 0 缺失本地文件、0 主动远程引用；file:// 271 页 0 加载失败、0 console 错误（仅已知的 Greek Roulette 无 src 国旗 2 处）；侧栏展开/收起 268 页全部 OK（login/register/recovery 无侧栏按钮）。

已完成：
- **生成的页面**（`build-page-from-capture.py`，采集都核对过 path 与骨架数）：
  - Casino 9 个：100000-jackpot、virtual-sports、crystal-rush、crash-games、game-shows、popular、tournaments-categories（template `casino-slots`）；casino-trading（`casino-play`，游戏布局）；casino-quick-popular-turbo-games（`casino-quick-crash-games`）。100000-jackpot 1440、game-shows 390 首次采集有骨架，已重采（`captures/cap-step4-retry/`）。
  - rules、poker-app（`bonuses`）；trading（`casino-play`；原站游客的游戏框本来就是一个常驻骨架，`captures/skeletons-trading.json`）。
  - Blog 58 个：7 个分类 + 51 篇文章（第二批 30 篇来自 Step 4 页面里的链接，`captures/cap-step4b-blog/`）。
  - Betwave 54 个（`betwave`）：第一批 12 个 + 各运动的 events / predictions 筛选 42 个（`captures/cap-step4b-bw/`、`cap-step4b-bwp/`）。
  - sports-esports-call-of-duty（`sports-esports-cs2`）。
- **无限滚动**：原站实测（`probe-more-cards.js` → `captures/cap-more/`）后为 100000-jackpot、virtual-sports、crash-games、game-shows、popular、popular-turbo-games 生成 `-more.js`；crystal-rush（10 个）、tournaments-categories（无游戏网格）原站不分页。五尺寸本地验收：标记越线才加载、0 重复、无横向滚动（`qa/casino-more-2026-10-15/step4-local*.json`）。
- **特殊路由（按原站实测）**：
  - `/forum`：原站整页跳到外部 `https://forum.one-vv3591.com/`（`captures/landing-forum.json`）→ 本地显示提示 “The 1win forum is a separate website and is not part of this preview.”
  - `/poker`：游客被重定向到首页（`captures/landing-poker.json`）→ `routes.js` `/poker` → `index.html`。侧栏/页脚 Poker 指向 `/poker-app`（已建页）。
  - 别名（原站实测落点，`captures/route-targets*.json`）：`/casino/live-casino` → casino-live、`/casino/quick-games` → casino-quick、`/casino/level-up`、`/casino/endorphina-e-drops` → casino、`/betting/stats` → sports、`/en/betwave/events/rainbow-six` → betwave-events-all（原站重定向到 all）。
  - 运动旧 slug：原站按数字 ID 选运动（`soccer-18` 与 `football-18`、`rugby-19` 与 `rugby-union-19` 内容相同，`captures/sport-slug-*.json`）→ `common.js` `routeFile()` 按同栏目同 ID 回退。
  - Betwave：`/betwave/...` → `/en/betwave/...`；event / prediction / `bw-<id>` 个人页是动态 ID，其它 ID 统一打开对应 sample 页。末尾斜杠忽略（`/poker-app/`）。
  - 比赛联赛页 `/betting/<栏目>/<运动>/<联赛>`（约 135 个，随实时赛程变化）→ 提示 “League pages follow the live schedule and are not part of this preview.”
- **修复**：
  - Betwave 子页内容被侧栏盖住：`css/local.css` 的 `#root` 横排补丁只对 `data-page="betwave"`，扩到 `data-page^="betwave"`（12 页侧栏检查从 FAIL 变 OK）。
  - `build-page-from-capture.py` 会把模板的 `-more.js` 带进新页面（5 个新分类曾加载 Slots 的游戏）→ 生成时去掉；已从 5 页移除。
  - `capture_clean.py` 下载非 ASCII 路径的图片失败（`füchse-berlin`、`gog-håndbold` 队徽）→ 请求前百分号编码；两个 handball 页重建后 0 缺图。
  - `file-protocol-check.mjs` 在负载高时会在共享 header/sidebar/footer 挂载前测量（误报 templatesLeft 3）→ 增加等待。
- **新工具**：`scripts/unresolved-links.mjs`（全站未落地链接，规则与 `routeFile()` 相同）、`maps-from-unresolved.mjs`（生成采集 map）、`summarize-page-basics.mjs`、`missing-shared-components.mjs`、`diff-shared-components.mjs`、`missing-capture-images.py`；本地探测 `local-page-basics.js`（状态/横向滚动/坏图/未落地链接）。

验收（证据 `qa/step4-pages-2026-10-15/`）：71 个非 Betwave 新页 × 五尺寸 × 游客/Demo（710 次，HTTP）：状态与尺寸一致、无横向滚动、无坏图、无未落地链接、console 只有浏览器自动请求 `favicon.ico` 的 404；48 个第一批新页（含 Betwave 12 个）五尺寸游客同样通过；resize 1440→390（游客）与 390→1920（Demo）通过；Forum / Poker 点击 1440、390 通过（`qa/local-poker-forum.json`）。构建日志 `qa/step4-build-2026-10-15.txt`、`qa/step4b-build-2026-10-15.txt`，收尾 `qa/step4-checks-2026-10-15.txt`，`qa/file-protocol-2026-10-15-step4-final.txt`、`qa/sidebar-toggle-2026-10-15-step4-final.txt`。

**Step 4 已知、有理由的差异 / 跳过项**：
- 按用户要求跳过 Betwave 剩余工作：`/en/betwave/events/padel` 没有页面（点击显示 “This page has not been captured yet.”）；第二批 42 个 Betwave 页已生成并通过 file:// 与侧栏检查，但未做五尺寸游客/Demo 逐页探测。
- 比赛联赛页不做快照（内容按分钟变化），显示提示。
- `/forum` 是外部站点，不做页面，显示提示。
- trading / casino-trading 的游戏布局 header（`variant-4_inGame`）在游客状态没有账户区，Demo 状态只换了侧栏的 Demo user 资料；原站登录后这个 header 是否显示余额需要已登录参考（见 Step 5）。

### Step 5 资源与像素 — 部分完成（2026-10-16 更新，已推送 `c995056`）
- ✅ 语言选择器 30 个国旗（原本是 `data:,` 懒加载占位）：`python scripts/fix-language-flags.py captures/language-flags.json --date …`。
- ✅ **2026-10-16 重复 srcset**：原站 1x/2x 两个 URL 下载成同一文件，`srcset="a, a 2x"` 会在高分屏显示成一半。`scripts/fix-duplicate-srcset.py` 修了 185 个文件、2451 处；`capture_clean.py` 以后自动去重。对比截图：`scripts/shot.mjs`。
- ✅ **2026-10-16 空 CSS 简写**：浏览器复制 CSS 时含 `var()` 的简写被清空（`background`、`grid-template`、`padding`）。`scripts/fix-empty-shorthands.py` 用原站源码恢复 46 条（`audit.css` / `styles.css`）。剩余未恢复的是 Betwave 骨架/关键帧，不影响显示。
- ✅ **2026-10-16 Tournament 倒计时**：不再从抓取时的剩余时间重新倒数。`scripts/add-countdown-ends.py` 给 12 个详情页写入 `data-local-ends`，`js/common.js initCountdowns()` 按结束时间计算；不足 1 天隐藏天数段。788262、817472 无正确抓取，仍按旧方式倒数。
- ✅ **2026-10-16 动画恢复**：本机 Windows `MinAnimate=0` → `prefers-reduced-motion: reduce`。本地 `css/motion.css` 曾在 reduce 下把 `common-layout_*` / `.swiper-wrapper` 的 transition 清零，`js/motion.js` 把 modal 收成仅 125ms 淡入，且 `motion.accordion` 的 height WAAPI 与原站 `grid-template-rows` 冲突。已改：保留原站 CSS 过渡；modal/drawer 在 reduce 下仍带 transform、时长 ≤160ms；侧栏/页脚展开只靠 CSS grid。验收：`scripts/motion-check.cjs` 通过；`qa/verify-motion-expand.json`（Casino 展开高度 52→160、modal duration 160、`spaceTransition` 0.3s）。
- ✅ **2026-10-16 侧栏展开菜单**：Casino / Sports / Markets / Betwave 四组已填入（`components/sidebar.html` → `js/components/sidebar.js`）；预览服曾缓存旧 9.5MB `sidebar.js`（展开为空），重启 `PORT=4174 node scripts/serve.mjs` 后 HTTP 与磁盘一致（11.8MB）。验收：`qa/verify-all-expands.json`（四组有链接与高度动画）。
- ✅ Promotions 占位图：`js/promotions*.js` / `promotions-modals.js` 无 `data:,`；`qa/promo-images-check.json` 1440/390 共 0 bad / 0 placeholders。
- ✅ **2026-10-16 游客布局对照（原站 ↔ 本地，首批）**：对照 https://one-vv3591.com/ 与本地 `http://127.0.0.1:4174`。19 个独特布局族 × 1440×900 / 390×844 = **38/38 通过**（侧栏顶栏导航数、首屏卡片、header/sidebar/banner 几何、横向溢出、坏图、展开菜单条目）。页面：Home、Casino、Slots、Live、Quick、Sports、Sports live、Markets、TOP Bets、Bonuses、Free money、Loyalty、VIP Club、Promotions、Tournaments、Blog、Rules、Poker app、Trading。工具：`scripts/compare-guest-layouts.mjs`、`scripts/probes/layout-metrics.js`；证据 `qa/step5-layout-2026-10-16/report.json`（含首屏 PNG）。说明：原站 footer 懒加载，探测在滚动后单独记 `ref-footer-unloaded`，不记为本地缺陷；首屏卡片在滚动前统计，避免触发本地 infinite-scroll。
- ✅ **2026-10-16 VIP Club**：采集态 `block-wrapper_hidden` / `cardHidden` 让中段空白。`js/common.js`：`initReveal()` 进入视口后去掉 hidden 并换成 `cardReveal`；`initVipLanding()` 负责 `cardsSection` 拖拽 + prev/next；`initMagneticSliders()` 数字滑块（每 3 秒一格，箭头/点击两侧数字，指示条 = 步数×(72−26)/(数量−1)，初始中间 $2.5M、左 $15M、右 10,000）；`initCardStacks()` Exclusive gifts（不自动轮播，箭头/点击/手机滑动，7 张循环）。`<p><div>` 被浏览器提前闭合导致文字掉出样式：`scripts/fix-p-div-nesting.py` 把 vip-club 3 个文件 150 处 `<p>` 改成 `<div>`。`css/local.css` 补 statistics 标题 `--title-gradient`。Concierge service 拖拽时卡片 `scrollLeft` 跟手，底部指示条同步（拖动中 `noTransition`，触摸走原生 pan-x）。验收：`qa/vip-club-verify.json`、`qa/vip-club-mobile-drag.json`、`qa/vip-concierge-drag.json`（1440/390 拖 160px，指示条约 24px）。Figma 桌面 `222:90161`、手机 `222:95406` 已按原站补中段内容（见文首）。
- ❌ Betwave 骨架/动态图片（mikhail lazarev、Lens、Sporting CP、RB Leipzig、PSV Eindhoven）——用户 2026-10-15 要求跳过 Betwave，暂不做。
- ✅ **其余三尺寸**游客布局对照（1920 / 768 / 430）：`qa/step5-layout-2026-10-16-3sizes/`。768/430 上 Casino、Live、Quick、Poker app 的 banner 高度差是 `aspect-ratio` 只读 `--v3bb7e4d4`、采集写的是 `--v773ad2f8`；`css/local.css` 已加 fallback。复测 Casino / Poker app @ 768/430：`qa/step5-layout-banner-recheck/` **4/4 OK**。768 上原站卡片仍在骨架加载时的数量差记为 `ref-cards-still-loading`，不算本地缺陷。
- ❌ **逐像素**全站对比（截图 diff / 修差异）尚未做；当前是结构与首屏布局指标，不等于像素验收通过。
- ✅ **2026-10-16 Tournament 详情排版**（`/tournaments/816330`）：采集 CSS 把 `grid-template-areas` / `grid-template-rows` 掏空，桌面端横幅、参与游戏、排行榜叠在右列。`css/local.css` 恢复 `"card leaderboard" / "games leaderboard"`，并让排行榜在 ≥768 重新 `position: sticky`（后写的 `players-leaderboard_root` 把 sticky 盖成 relative，`top: 20px` 会把它下移）。1440 横幅 720×244、排行榜 328，1920 与原站同为 1108×244 + 420。证据 `qa/tour-816330/`。
- ✅ **2026-10-16 Loyalty Program 奖杯图过小**：Levels and Rewards 采集把同一张 ~270px 图同时标成 `1x` 与 `2x`，高分屏（deviceScaleFactor≥2 / Windows 缩放）按 2x 显示成约 135×100。`css/local.css` 给 `.level_foreground-thziT` 设 `width:100%`，图按卡片宽度铺满，复测 1440/768/390 在 DPR1 与 DPR2 均为 268×199（与原站一致）。证据 `qa/loyalty-trophy/after.json`、`card-dpr2.png`。
- ✅ **2026-10-16 Trading 游客 Authorization 弹窗间距**：采集把 `.modal-footer_root` 的 padding-top/right/left 掏空，Register / Log in 贴着说明文字和卡片左右边。`css/local.css` 只对 `[data-testid="game-auth"]` 补回 `var(--padding)`（≥1024 为 20px，更窄为 16px）。复测与 https://one-vv3591.com/trading 一致：1440 卡片 390×172、距视口上下 364 / 左右 525，页脚 padding 20，按钮间距 12；390 底栏 390×206、贴底贴左右，页脚 padding 16，两按钮间距 12。证据 `qa/trading-auth-popup-2026-10-16/`、`qa/trading-auth-after-local.json`。同一弹窗的 casino-trading 一并对齐。
- ❌ **筛选/子页抽检**（sports-live-*、casino-live-*、blog 文章等复用布局）尚未逐页对照。
- ✅ **2026-10-16 Demo（已登录）对照**：用本人已登录的 Chrome（没有输入凭据，余额在本地仍是 0.00 / Demo user）对照原站与 `?preview=auth`。先查主布局族（Home、Casino、Sports、Bonuses、Free money、Loyalty、VIP Club、Promotions、Tournaments、Trading、Casino Trading、Casino Slots，1440 / 390 / 1920），再查全部已注册页面。`scripts/compare-auth-all.mjs` 对 265 个页面 × 1440×900 / 390×844 做结构对照（余额、Login、通知、底栏、顶栏高度、横向溢出），证据 `qa/auth-all-2026-10-16/report.jsonl`：529 项一次通过，原站全程保持登录。唯一失败是 `betwave.html` 1440：这个文件不加载页面状态，`?preview=auth` 仍显示 Login。`js/betwave-runtime.js` 在 Demo 下把顶栏右侧换成已有的 Betwave 登录顶栏（vUSD、余额 **0.00**、Create prediction、通知），并在站内切换时保留 `preview=auth`。复测 `betwave.html` 1440 与 390 均为余额 + 通知、无 Login。另两处设计差已修：`scripts/fix-auth-login-chrome.mjs` 把 35 个放错尺寸的 Demo 状态改成同尺寸游客正文 + 已有的登录顶栏/侧栏（`node scripts/auth-state-audit.mjs` 为 **0**）；Trading 与 Casino Trading 的游戏顶栏原来是空的 actions 格并弹出游客 Authorization，现已放入余额和存款，手机不放通知按钮（原站 390 也没有）。这是结构对照，不是逐像素通过。
- ✅ **2026-10-16 Demo 账户操作**：登录后顶栏和侧栏能点开的账户功能接到本地预览，不连真实账户。余额打开 Balance（RM 0.00、点数 0、六种加密货币 0），Deposit 打开法币（FPX / Touch n Go / DuitNow / GrabPay）和加密货币，继续下一步只提示不付款。通知是顶栏下拉（All / Personal / General）。资料面板里的存款、提款、优惠码、投注记录、流水、客服、设置各项都能打开；姓名保持 Demo user，ID 00000000。侧栏投注记录、Windows 应用和客服同样打开本地面板。验收：`vip-club.html?preview=auth` 390 与首页 1440。
- ✅ **2026-10-16 弹层被页面挡住**：余额等本地弹层没带采集弹层的 `z-index: var(--z-index-modal-layout)` 和卡片底色，首页活动卡画在 Deposit / 1win Points 上面。`js/common.js` 的账户弹层补上与资料弹层相同的层级和底色；通知下拉从 z-index 80 提到同一层（顶栏是 140）。file:// 首页复测 390 与 1440：Balance、Deposit、付款方式、通知、Profile、Withdraw、Settings、Name、客服、优惠码、投注记录、Windows 应用，以及游客 Login / Registration，采样点都落在弹层内，卡片底是白色，后面的页面被压暗。不是逐像素通过。
- ✅ **2026-10-16 登录预览功能点选**：`index.html?preview=auth` 侧栏和顶栏逐项点过。Profile、Balance、Deposit、通知、各组导航、Forum、Trading、Poker、斗鸡、语言、客服、Windows 应用都会打开对应页或弹层。设置里的 Email 原来是 `div`，点不到；已能打开 Email 表。姓名仍是 Demo user，ID 00000000，余额 0.00。当时本机 Chrome 没有调试端口，没有关浏览器，也没有读取登录会话。Betwave Create 的登录后表单不在采集里，仍是游客 Authorization。
- ✅ **2026-10-16 宽窗口点 Demo user**：窗口宽到 1680 以上会用 `profile-1920x1080`。这份采集少了 `desktop-modal_open`，底和卡片透明度停在 0，弹层在页面里但看不见。打开时补上这个 class。1920 下再点侧栏 Demo user，Profile 卡片可见。姓名仍是 Demo user，ID 00000000，余额 RM 0.00。
- ✅ **2026-10-16 Deposit / Withdrawal**：从已打开的登录页读了弹层结构，没有关 Chrome，没有读取登录会话。Deposit 的 Fiat 用 FPX、Touch n Go、DuitNow、GrabPay 原图；点进去有金额、RM 80/150/400/600、Bonus 100、说明和 100% casino bonus。Crypto 有 USDT / Ethereum / Solana、Tron (TRC-20)、最低额和 Connect wallet。地址栏写 Preview only，不放真实收款地址。Withdrawal 先是奖金作废提示，再选 Malaysian banks 或 Touch n Go。银行表有 16 家银行、姓名、账号、金额 RM 100–15,000。余额仍是 RM 0.00，不会真的付款或提款。
- ✅ **2026-10-16 Demo 顶栏/侧栏外观**（`?preview=auth`，file://）：结构对照没抓到正文里的设计差。宽屏（≥1680，本机最大化常走 1920 状态）登录顶栏用了没有 Home / Casino / Free money / Sports 的 `header.standard.home-1920`，一部分桌面状态误用了手机顶栏；VIP Club 与 Loyalty 的 1920 侧栏是采集时的关闭态（`common-layout_offscreen`），侧栏整列消失。手机 VIP Club 奖项条 `--edge-offset` 被写成侧栏宽 280px，<1024 时整条被平移出屏幕左侧（原站 390 与 768 都是 0，条左缘贴齐）。已改：宽屏改回带导航的已有登录顶栏（首页用 `header.standard.home-1440x900.8299c65e`，其余用 `header.standard.blog-1440x900.0a436624`），手机改回 `header.standard.blog-390x844.fc0e8612`；关闭态桌面侧栏改回该页可见的登录侧栏；`css/local.css` 在 <1024 把奖项条 `--edge-offset` 固定为 0。余额仍是 **0.00**，侧栏仍是 Demo user / ID 00000000。Betwave 未改。端口 9335 的已登录 Chrome 当时没开，宽屏导航和奖项位置对照的是游客原站实测（1920 顶栏有四项导航、侧栏 280、奖项条左 658 宽 884；390/768 奖项条左 0）。复测 file://：VIP Club 1920 顶栏 280×68、导航四项、余额 0.00、奖项 658×884、无横向滚动；390 奖项左 0 宽 390；768 奖项左 0 宽 768。Loyalty、Home（`index.html`）、Bonuses、Free money、Promotions 在 1920 与 390 同样是余额 + 通知、无 Login；宽屏有四项导航，手机没有（与原站一致）。Bonuses / Free money 的 1440 顶栏本来就是对的，没有改组件。不是逐像素通过。
- ✅ **2026-10-16 Demo 正文（宽屏/手机放错的登录内容）**：顶栏修好之后，仍有几页在某个尺寸用了游客正文或未加载完的骨架。Free money 1920 的 Lucky Drive 是空骨架（`padding-bottom: 214px` 的空白块，真的活动卡片在它下面）；`css/local.css` 藏掉这个骨架，并从 `js/freemoney-auth.js` 的 1920 状态里去掉该节点。Loyalty 1920 与 768 仍是游客的 “Participate” 大横幅，登录后的等级进度只在 1440 / 390；已把那两份进度正文配上对应尺寸已有的登录顶栏/侧栏（宽屏侧栏用可见的 1440 登录侧栏，不用关闭态 1920 侧栏）。Bonuses 390 与 768 没有登录后的 Refund；已改用 430 那份带 Refund 的手机正文。复测 file:// `?preview=auth`：VIP Club 1920 侧栏 280、顶栏四项导航、余额、无横向滚动，390 奖项条贴左；Loyalty 1920/1440/390/768 为 Progress、不是 Participate；Bonuses 1920/1440/390/768 有 Refund；Free money 1920 不再出现 Lucky Drive 骨架；768 原来与游客正文相同（邮箱验证积分），已改用 390 那份登录正文（1win Points、VIP Loyalty Program）。VIP Club 的 FAQ 手风琴原先只在 `FaqSection` 里能展开，点击没有反应；`js/common.js` 对带正文的页面手风琴同样切换，页脚导航手风琴仍走原来的逻辑。1440 与 390 点击后答案高度从 0 变为可见。余额仍是 **0.00**。端口 9335 的已登录 Chrome 当时没开，VIP 正文几何对照的是游客原站（1440 顶栏/英雄位置一致）和用户附的登录后整页截图。不是逐像素通过。

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
- Step 4（详见 §4）：125 个新页面及其 `js/<page>.js` / `-auth.js` / `-more.js`；`js/common.js` 新增 `routeFile()`（Betwave 别名与样例、运动 ID 回退、末尾斜杠）、Forum 与联赛页提示；`js/routes.js` 新路由与别名；`css/local.css` Betwave `#root` 补丁；`scripts/build-page-from-capture.py`、`capture_clean.py`、`file-protocol-check.mjs` 修复；新脚本见 Step 4。Step 4 已 commit（未 push）。
- 2026-10-15 下午本文件的工作副本被另一条工作线整体改写（HTML 进度段落被替换为 Figma / 旧 HTML 基线内容）。为不覆盖它，本节从 Step 3 提交版恢复、更新后追加在文件末尾；顶部内容未改。
- **2026-10-16 已推送** `10154e5`（tournament 详情网格、重复 srcset、倒计时、VIP 揭示/滑块/叠卡、空 CSS 简写、`<p><div>`）与 `c995056`（侧栏展开、动画、五尺寸游客对照、banner 比例、Concierge 跟手、Trading 登录弹窗间距、Loyalty 奖杯）。改动文件：`css/local.css`、`css/motion.css`、`css/inline-masks.css`、`js/common.js`、`js/motion.js`、`js/dialogs.js`、`components/sidebar.html`、`js/components/sidebar.js`、`js/components/header.js`、`scripts/compare-guest-layouts.mjs`、`scripts/fill-sidebar-expand-menus.mjs`、`scripts/fix-duplicate-srcset.py`、`scripts/fix-empty-shorthands.py`、`scripts/fix-p-div-nesting.py`、`scripts/add-countdown-ends.py`、`scripts/shot.mjs`、`scripts/motion-check.cjs`、`scripts/probes/`。证据：`qa/step5-layout-2026-10-16/`、`qa/step5-layout-2026-10-16-3sizes/`、`qa/step5-layout-banner-recheck/`、`qa/tour-816330/`、`qa/vip-club-*.json`、`qa/vip-concierge-drag.json`、`qa/trading-auth-popup-2026-10-16/`、`qa/loyalty-trophy/`、`qa/verify-all-expands.json`、`qa/verify-motion-expand.json`。重跑布局对照：`node scripts/compare-guest-layouts.mjs`（需 `PORT=4174`；可用 `--only casino,sports --sizes 1440x900,390x844 --out DIR`）。未纳入提交的只有临时抓取 `qa/tmp-*`、`scripts/tmp-*`。
- **2026-10-16 本地论坛**：原先 `/forum` 只弹提示、不建页。现已做成静态预览：`forum/` 522 页（首页、29 个版块、489 个首页和各版块第一页链到的帖子、登录/注册/找回密码），样式与图片在 `css/forum/`、`assets/forum/`，`js/routes.js` 的 `/forum` 指向 `forum/index.html`，`js/common.js` 不再拦截。表单不提交、不登录。未收录：帖子第 2 页以后、会员资料、搜索结果、RSS。证据：`qa/forum/local-check.json`、`qa/forum/local-desk.png`、`qa/forum/local-mobile.png`。
- ✅ **2026-10-16 直接双击 HTML（file://）**：主站首页游客 / `?preview=auth`、VIP Club 390 双击即可显示，图片 0 坏，存款和通知面板能开。论坛帖子原先用 `//web-k8s-forum-prod...` 的样式和图片，双击时会去找本机路径并 404；版块链接是 `/版块/`，会跳出站点根目录。已把 320 个样式和图片放到 `css/forum/`、`assets/forum/`，521 个论坛页改成相对路径；版块和分页链到已有的 `版块.html`。复测 file://：`forum/topic-2203.html` 1440、`forum/2-casino-promotions.html` 390、`index.html` 1440，背景色正确，图片 0 坏，网络 0 失败。帖子里的 Casino 是 `../casino.html`。Twitter / Telegram 等仍是外链。不是逐像素通过。
