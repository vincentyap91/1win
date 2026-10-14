# 1win 项目流程与维护记录

最后更新：2026-10-14（Asia/Kuala_Lumpur）。本文件为后续维护的首要交接记录。以下保留阶段历史，最新结果和待办以文件末尾的最新维护记录为准。

## 工作约定

- 用户指定的当前交付与后续维护目录：`C:\Users\vince\OneDrive\Desktop\website\1win`。本次使用 `C:\Users\vince\OneDrive\Documents\ChatGPT\1win` 的最新项目副本修改与验收，再将本轮变更同步回用户指定目录；副本不作为另一份独立交付。下文 Vincent 路径仅为历史记录。未从旧 ZIP 覆盖现有代码。
- 唯一设计参考：`https://one-vv3591.com/`。只调查此站内容，不打开广告或跳出此域名。
- HTML / CSS / Vanilla JavaScript；各页面独立 HTML，共用 assets、css、js；同一页面调整浏览器宽度显示手机布局，不建立独立 mobile 目录。
- 用户已选择：默认保留未登录界面，提供登录后预览切换。登录后本地显示 Demo user、ID 00000000、余额 0.00，不连接真实账户。
- 用户允许对照其 Chrome 已登录页面。只查看设计，不改账户、不充值、不投注。
- 每次维护追加：发现 → 原站证据 → 原因 → 修改文件 → 验证 → 未完成项。已捕获、已实现、已对照、已测试是不同状态；不宣称全站 100% 完成。
- ChatGPT 项目 sources/ 是只读参考。旧工作目录和旧 ZIP 不代表当前交付版本，不覆盖本目录现有修复。

## AI Reasoning & Execution Strategy

Prioritize accuracy and visual fidelity over speed.

Use deeper analysis for website investigation, design-system extraction, complex interactions, debugging, and pixel-perfect visual QA.

For straightforward and repetitive implementation tasks, work efficiently while preserving the established design rules.

Never reduce visual quality to save reasoning effort.

Complete and verify each implementation phase before proceeding to the next.

If a task requires more reasoning, report the issue and recommend increasing the reasoning level when necessary.

### 附件 prompt 的执行与阶段验收约束（2026-10-14）

- 目标是可验证的最高视觉与前端行为保真度；不重新设计，不凭空生成未观察布局、素材或交互，不以相似效果代替可精确实现的效果。
- 附件完整规范保存在 `reference/PROJECT-PROMPT.md`。流程按调查与页面清单 → 设计和素材提取 → HTML 实现 → 响应式复制 → 截图比较 → 功能验证 → QA 报告执行。
- 接续现有项目时按页面／状态补齐缺失阶段证据；历史生成、捕获、静态检查或结构对照不等同视觉／功能验收。未满足前置证据的项目保留 pending 或 blocked，不跳到完成。
- 必检窗口：1920×1080、1440×900、768×1024、390×844、430×932，并检查中间宽度连续缩放。比较应保持窗口、缩放、滚动、登录预览、弹窗和动态内容状态一致。
- 每个页面及重要状态保留原站／本地截图，逐项查坐标、字体、换行、间距、图片裁切、颜色、阴影及交互；可行时补图像差异统计。动态 feed 与轮播差异单独记录，不能据此声称像素完全一致。
- QA 逐项记录 URL、本地入口、调查、实现、视觉比较、功能测试、已知差异、素材缺口及阻碍；README、PAGES、PROGRESS 与最新交付状态保持一致。
- 原站账号、支付、投注和提供商服务不接入本地。不可采集、存储或传输真实凭证与付款数据；本地账户和业务模拟明确标为 Demo。
- 原素材只在访问与使用许可范围内使用；不可取得或受限的素材记录原因，未经用户同意不生成替代艺术素材。不可访问的页面记录阻碍。
- 若复杂问题需要更深推理，说明具体问题并建议提高 reasoning level；不声称已经自行改变模型或推理设置，不以减少思考为理由降低质量。

## 已完成历史

1. 读取 LOCAL-CODEX-PROMPT.md 和准备材料，确认按原站设计复制。
2. 提取原站 DOM、CSS、SVG、图片、字体与截图；完成旧版首页五尺寸对照。
3. 根据 Desktop\1xbet 示例改为独立多页 HTML、共享素材。
4. 根据用户要求合并为响应式页面；修复手机侧栏 inert 点击穿透、弹窗缩放状态与输入标签重叠。
5. 用户指出直接打开 HTML 缺图、Casino / Sports 不完整、Free money 标签滚动吸顶不一致；开始本轮审查。

旧版首页截图指标只对应旧版本。本轮替换了页面状态，不能沿用旧指标作为当前全站验收。

## 2026-10-13 本轮已实施

| 项目 | 修改与结果 | 验收状态 |
| --- | --- | --- |
| 素材修复 | 扩大已观察图片、字体映射；处理编码空格和图片格式变体；恢复 Blog、Betwave、Free money 等多处缺图 | 静态缺图报告改善；仍有 Casino / Sports 素材缺口 |
| 直接打开 HTML | 所有资源使用相对路径；CSP 支持 file:；字体嵌入原始字节，减少本地文件字体跨源问题 | 本地 HTTP 预览验证；实际双击 file:// 视觉验收未完成，浏览器工具此前拒绝此协议 |
| Sports | 新增 sports、sports-live、sports-upcoming、sports-esports 独立页面，包含已观察赛事区、联赛图标和投注单界面 | Sports 1440 桌面实际查看过；全部尺寸与按钮未验收 |
| Casino 分类 | 新增 Slots、1win games、Live casino、Quick games 页面；主要分类按钮映射本地页面 | 页面已生成；分类素材、平板内容和部分入口仍不完整 |
| Free money | common.js 增加滚动选中、标签定位；local.css 增加桌面/手机吸顶布局 | 已实施；实际滚动验收待补 |
| 登录后预览 | 共享预览开关、Alt+P、preview=auth 查询状态；导航延续预览；真实账户数据替换为示例数据 | 首页默认未登录及切换到 Demo user 已在浏览器验证；其他页面待逐页验收 |
| 登录页与注册页 | 保留独立 login / register / recovery 入口并引入新增共享资源 | 弹窗历史测试通过；入口背景与最新首页一致性待查 |
| 同域资源约束 | 原站可观察内容素材本地化；广告/跟踪素材排除；外链不跳转；禁止本地页面连接账户服务 | 尚需汇总最终全站链接检查 |

## 扩大检查前的目录快照与代码职责

- 根目录目前 25 个 HTML：24 个页面入口 + 1 个误生成的 freemoney-sticky.html 证据页面，待清理。
- 内容入口：index、casino、casino-slots、casino-1win、casino-live、casino-quick、casino-search、casino-search-results、casino-providers、sports、sports-live、sports-upcoming、sports-esports、freemoney、bonuses、loyalty-program、vip-club、promotions、tournaments、blog、betwave。
- 账户展示入口：login、register、recovery。
- js/common.js：共享交互、响应式状态切换、登录后示例预览、导航、Free money 标签等。
- js/<page>.js：未登录 DOM 状态；js/<page>-auth.js：登录后状态；js/dialogs.js：已观察弹窗与侧栏 SVG。
- css/styles.css：原样式；css/audit.css：本轮捕获样式；css/local.css：本地交互与布局修复。
- reference/audit/：已清理账户数据和远程资源的 DOM 参考；捕获不等于验收。
- qa/asset-provenance.json：资源 URL 与本地文件对应。只保留原站观察到的页面内容图片/字体。
- qa/audit-capture-report.json：各捕获页面、窗口和缺图 alt 列表。
- qa/audit-resource-gaps.json：未映射 URL 与打包失败原因。
- qa/audit-routes.json：原路径与本地 HTML 对应。
- qa/current-resource-audit.json：本轮最初的 16 页缺图诊断，只代表修复前状态。
- scripts/serve.mjs：本地预览；scripts/reference-capture.mjs：浏览器支持的只读采集辅助；scripts/audit-update.py：整合已采集素材和状态。

## 扩大检查前的证据与统计说明

捕获窗口：1920×1080、1440×900、768×1024、390×844、430×932。首页、Casino、Free money、活动/会员相关主页面、Blog、Betwave、Sports 的游客和登录状态已采集多个窗口；新增分类主要采集游客内容。

最近一次整合输出：22 个内容状态集合（包含误生成 sticky 证据集合）、147 个捕获记录、331 个 CSS 块、1060 条素材来源映射、1159 条未映射 URL。1159 包含未使用 CSS 背景等，不等于页面可见缺图。捕获报告中缺图引用合计 571，跨尺寸重复计数，也不等于 571 张唯一缺图。

最新 1440 桌面静态报告：Blog、Betwave、Free money、首页、游客 Casino 等捕获不再有 img 的空素材；Sports 仍缺 MLB / NFL / UFC Fight Night / USA Grand Prix 图标；登录 Sports 另有队标；Slots 和登录 Casino 仍有部分游戏封面缺失。其他窗口缺口必须按报告逐项检查，不能据桌面结果宣布全页修复。

原站登录后会变化：账户区、余额/充值入口、首页轮播、部分活动与推荐。新增分类的部分本地登录状态使用已观察的共享登录头部 + 游客分类内容；状态中 coverage 字段明确标注，不能当作完整登录后页面对照。

## 验证记录

| 验证 | 结果 | 限制 |
| --- | --- | --- |
| common.js 语法检查 | 通过 | 不代表全部交互通过 |
| 默认首页预览 | 浏览器确认没有 Demo user，存在“登录后预览”按钮，无横向溢出 | 本轮仅当前窗口 |
| 首页登录后预览 | 点击后显示 Demo user、“切回未登录”；URL 带 preview=auth | 跨页面与手机待验收 |
| Sports 桌面查看 | 已观察赛事列表、分类、投注单布局 | 仍缺部分素材和细节交互 |
| 静态游客资料检查 | 首页默认不含 Demo user | 已修复早期误替换游客侧栏名称问题 |
| Free money 吸顶 | 修改已保存 | 浏览器滚动验证待完成 |
| 双击 HTML | 文件兼容性修改已保存 | 实际 file:// 视觉检查未完成 |

## 扩大检查前的待办快照

1. 修复 Casino 分类初始加载不足，优先 Slots 768×1024（现有捕获等待加载，游戏内容明显偏少）；Live casino / Quick games 及多个尺寸仍缺素材。避免把加载中 DOM 当完成页面。
2. 核验 Free money 吸顶位置、标签点击定位和滚动选中；桌面与手机均检查。
3. 补齐 Sports 四个联赛图标、登录状态队标，检查 Live / Upcoming / Esports 的内容和导航；赔率/投注属于本地界面展示，目前没有完整投注单交互。
4. 检查未实现 Casino 分类：Fishing、Bonus buy、Bonus wagering、Jili、New、Only on 1win、AI recommendations；先观察原站，再建立对应本地入口。
5. 清理 freemoney-sticky.html 和对应状态脚本：它是滚动证据，被采集文件名匹配规则误当独立页面。整合脚本应排除此类证据，保留 reference 中的滚动资料。
6. 本地预览开关在各页、各窗口、页间导航测试；新分类登录内容的覆盖范围保持明确。
7. 搜索/供应商页面主要沿用旧桌面捕获；手机搜索、供应商筛选、币种下拉、FAQ、未映射按钮和弹窗细节待查。
8. login / register / recovery 默认背景与新版首页同步；随后补全全页五尺寸截图对照、按钮检查和缩放连续性。
9. 实际在 Chrome 双击 index.html 测试图片、图标、字体及各页相对链接，不以 HTTP 结果替代 file:// 验收。
10. 完成后更新其他 README / PROGRESS / PAGES / QA 清单并重打包。目录外已有 ZIP 尚未同步本轮修改。

有限捕获无法包含原站所有无限加载游戏；赛事、赔率、活动和倒计时会随时间变化。现阶段仍是进行中的设计复刻，没有完成全站逐页验收。

## 接续方法

先读本文件，再看 qa/audit-capture-report.json 对应页面缺口；从本目录现有文件接着修，不从旧 dist 或 ZIP 覆盖。

本地预览：在本项目目录运行 `node scripts/serve.mjs`，访问 `http://127.0.0.1:4173/`；完成验收后停止服务。默认游客，页尾“登录后预览”或 Alt+P 切换，`?preview=auth` 为示例状态。

整合脚本当前需两个参数：采集暂存目录与旧参考目录。历史位置分别为 `C:\Users\Vincent\.codex\.chatgpt-projects\g-p-6acd6d8dc63881918beeb8016a071736\audit-staging` 与同目录 `1win-clone`。素材清单内可能仍有临时文件路径，不能假设离开当前电脑后可直接重建。后续应整理可移植输入；普通维护可直接改本目录共享 CSS / JS 和现有状态文件。

重新采集只用浏览器支持的只读采集工具；不要访问广告、读取凭据或保存账户会话信息。登录后证据归档前替换个人资料。每次重新生成后必须确认没有覆盖 common.js / local.css 的直接修复，并运行针对本次修改的验证。

## 用户最新安排

用户先要求保存检查点以减少 token 消耗，随后明确要求：继续记录，再扩大检查范围。当前先保存上述真实状态，然后依优先级继续检查；未完成项保持明确标注。


## 扩大检查后的最新记录（2026-10-13）

### 本轮新增与修复

- 新增并接通六个独立页面：casino-fishing.html、casino-bonus-buy.html、casino-bonus-wagering.html、casino-jili.html、casino-new.html、casino-only-1win.html。所有页面仍在本目录；全部采用同页响应式。
- 现在共 30 个 HTML：27 个内容入口 + login / register / recovery。Casino 的 11 个已观察游客分类按钮都已映射本地页面。没有新增 mobile 目录。
- Slots 768 平板旧参考只含加载状态。重新滚动读取完整资料后，本地对应状态有 484 个游戏入口，全部封面加载完成，未发现横向溢出。1920 / 1440 / 390 / 430 的内容仍为各自已观察列表，不代表全站所有游戏。
- Quick games 的五尺寸资料重新等待游戏加载后保存，封面缺口已修复。
- 原站每次换尺寸可能重新请求游戏。初次快速采集的六个分类有部分桌面/平板占位状态，已重新等待至少七个游戏图片节点后再保存；最终本地实际验收通过。
- 单份 Slots 参考字符串曾被工具截断，导致生成时缺少 body、回退到桌面状态。已改用 60000 字符分块并重新保存；整合脚本拒绝带 [Truncated] 的 HTML。
- freemoney-sticky.html 及两个对应状态脚本已经清理；脚本排除 -sticky 证据集合。滚动证据仍可保留在 reference，不能当独立业务页面。
- login / register / recovery 的背景已同步当前首页；整合脚本中也更新此规则，减少下次生成回退到旧背景的风险。
- 共享导航更新于 js/common.js，生成与本地修复继续分别保留在 scripts/audit-update.py、css/local.css 中。

### 最新验证结果

| 检查 | 实际结果 | 未覆盖内容 |
| --- | --- | --- |
| 六个新分类 × 五尺寸 | 30 组浏览器检查：状态正确，有游戏卡片、无缺图、无横向溢出、预览按钮存在 | 未做每组像素级截图差异统计或全部按钮验收 |
| Slots × 五尺寸 | 连续 resize 能切换相应状态；平板最终 484 个入口，brokenImages=0、pendingImages=0 | 加载大量封面时短暂等待属于加载过程，不能误当资源丢失；尚未复制全部无限加载游戏 |
| Quick games × 五尺寸 | 连续 resize、图片、溢出及预览按钮检查通过 | 游戏详情与供应商业务服务未接入 |
| Sports / Live / Upcoming / Esports 1440 | 四页都有预览按钮且无横向溢出；三个子页当前无破图 | Sports 主页面仍缺 MLB / NFL / UFC Fight Night / USA Grand Prix；手机全交互待查 |
| Free money 桌面 / 手机 | 实际滚动后 nav 顶部分别 16px / 0px；Cashback 点击定位和滚动选中正常；手机无横向溢出 | 全部标签在所有尺寸逐一定位及精确视觉对照未完成 |
| 新分类导航 | 点击 Fishing 进入本地页面；登录后预览切换，再进入 Jili 仍带 preview=auth、显示 Demo user | 通用登录头部预览仍不等同全部分类专属登录内容 |
| login 独立入口 | 当前首页背景上的登录对话框显示正常，默认没有 Demo user | register / recovery 本轮未逐一浏览器重新验收 |
| 全目录静态资源与链接 | 30 个 HTML + 游客/登录状态：missing_local_files=0、active_external_references=0 | data:, 占位仍按素材缺口另行记录；此检查不替代 file:// 浏览器验证 |
| 语法检查 | common.js、reference-capture.mjs 检查通过；整合脚本实际运行通过 | 不代表所有行为完成 |

证据保存：

- qa/expanded-browser-qa.json：45 条本地窗口检查记录；Slots 的早期 resize 图片未完成记录被最后 settled 检查明确补充，不应视为最终破图。
- qa/expanded-static-qa.json：全目录资源/外部引用检查。
- qa/fishing-desktop-verified.png：新增 Fishing 页面 1440 桌面结果。
- qa/slots-tablet-verified.png：修复后的 Slots 平板结果。

### 最新素材与覆盖统计

最终整合：27 个内容状态集合、175 个原站捕获记录、331 个 CSS 块、1596 条素材来源映射、299 条未映射 URL。未映射 URL 仍包含未使用样式中的资源，不能当作可见图片数。

最新捕获报告的空素材 img 引用合计 91：Casino 11、Sports 80，跨游客/登录状态与窗口重复计数。其余已报告页面的 img 空素材引用为 0。这仅说明当前捕获中的图片映射，不能证明页面全部内容或交互完整。Sports 又取得一些当前队标，但历史登录捕获中的旧队标没有全部恢复；不能随意用其他球队图片代替。

调查原站 Sports 时，四个联赛图片节点存在，但实际图片未成功加载；未取得可用文件。继续记录为未解决，不能声称本地完整或拿其他网站图片补位。

### 当前仍未完成，接着从这里维护

1. Sports 主页面四个联赛图标、登录状态旧队标；结合最新原站资料重新核对赛事内容与各窗口，保持队伍/图标对应，避免用不相关素材替代。
2. Casino 主页面剩余 11 次空素材引用，以及登录后的 AI recommendations 专属内容。六个新增分类的登录状态目前使用共享登录头部与游客内容，须继续标注覆盖范围。
3. Casino / Sports 所有详情、次级列表、筛选、供应商弹窗和手机搜索；进一步核查页脚和侧栏未映射入口、FAQ、币种选择等交互。游戏启动、账户与真实支付仍属于原服务，不应由本地预览提交。
4. 所有页面的五尺寸视觉逐项对照、连续缩放后的弹窗/焦点/滚动状态；当前只对本轮列出的内容做了实际验证，不是全站验收。
5. Chrome 双击 HTML 的真实 file:// 验收仍未完成。已做兼容性修改和本地路径检查；不要把 HTTP 成功误写成双击已验证。
6. register / recovery 入口重新验收；再整理 README / PROGRESS / PAGES 与旧 QA 清单，避免和本文件最新状态矛盾。
7. 将整合脚本所需暂存输入整理为可移植资料，当前仍有外部暂存目录依赖；最后再更新目录外旧 ZIP，旧 ZIP 尚不含本轮修改。

### 后续维护记录要求

每次开工先读本文最新段与对应 QA，再继续当前目录中的代码。每完成一项即更新：具体文件、原因、实际窗口、验证结果、仍欠缺的状态。保留历史，但标明被新结果替代的记录；不要把“捕获成功”“页面生成成功”写成“100% 复刻完成”。

本轮停止时会关闭临时预览服务、清理自建调查/测试页并恢复临时浏览器尺寸；用户 Chrome 登录会话保持。下次继续时重新启动 scripts/serve.mjs，按上面的待办进行。

收尾实际状态：临时预览服务已停止，自建参考/测试标签已关闭，内置浏览器临时尺寸已恢复。Chrome 原标签的尺寸恢复调用未成功（原标签未附加浏览器控制），因此 Chrome 尺寸恢复尚未确认；未登出或修改用户账户。下次维护先确认原 Chrome 页显示正常再继续对照。

## 逐页图标与元素差异审查（2026-10-13，进行中）

用户提供了 1920 首页截图：图片与社交按钮正常，但侧栏 Casino / Sports 等菜单及顶部 Home / Casino / Free money / Sports 图标空白。用户要求检查每一个网页并补齐设计差异。

第一项修复：确认这些是 CSS mask-image 图标；文件实际存在，普通 img 与内联 SVG 正常，现象与 file:// 下蒙版资源跨源加载限制吻合。已将 85 个原站图标素材嵌为 data URL，覆盖 8889 次引用、262 个 HTML / 状态 / 样式 / 参考文件，并更新 scripts/audit-update.py 防止重新生成后丢失。新增维护工具 scripts/local_mask_assets.py。证据：qa/mask-icon-repair.json。这不是在其他网站替换图标，使用的都是已保存的原站素材。

本轮浏览器明确拒绝操作用户 Chrome 中的 file:// 标签，因此没有绕过限制；逐页浏览器验收采用本机 HTTP 开发预览，实际双击的最终视觉结果仍需明确标为待确认。接下来继续逐页对照同域原站元素、加载状态、手机布局和图标，最终记录每页实际覆盖与剩余问题。


## 动画与全页面差异整合（2026-10-13，已交付；剩余项见下）

本段是最新状态，取代上文“Sports 四个联赛图标尚未取得”“分类页只有共享登录头部”“Casino 剩余 11 次空素材”“全项目只有 16 / 30 HTML”等旧结论。历史记录保留用于追溯。

### 本轮完成

- 所有修改仍在 C:\Users\Vincent\OneDrive\Desktop\1win\1win-html-project。现在共 31 个 HTML、28 个内容状态集合；依然是静态多页、共享 assets / css / js，缩放同一页面即可看手机布局。
- 24 个已有普通主页面做了 1920 原站／本地结构对照，主要标题没有缺失。另补实际 AI recommendations 页面，以及 Search / Search results / Providers 的五尺寸参考。原站未登录访问 AI recommendations 会回 Casino；本地 guest 使用观察到的 Casino 回退内容，auth 显示该推荐页。
- 登录参考通过用户已登录的 Chrome 会话取得，无需输入密码。25 个普通／推荐页面各五尺寸，合计 125 个真实登录捕获；使用 Demo user、ID 00000000、余额 0.00。本地不会访问真实账户。Search / Search results / Providers 的登录版本仍是原站 guest 弹窗加已观察登录头部，须明确区分。
- Profile 与 Settings 弹窗各五尺寸，共 10 个匿名原站布局，写入 js/account-dialogs.js。点击登录后预览的账户区域可打开 Profile，再进入 Settings；Back / Close 可操作，Log out 只切回本地 guest。修改资料、密码、End sessions、交易与付款操作仍是本地提示，没有连接原站。
- 首页／顶部／侧栏 mask 图标使用原有 SVG 的 data URL，保留普通图片的本地路径。初次修复 85 个素材、8889 处引用；整合脚本继续保留嵌入。手机侧栏中的 plug 占位恢复为观察到的真实图标。
- Sports 四个联赛图标通过水平滚动原站栏目后加载并取得；最新队标重新采集。供应商 Koala、Tom Horn Gaming、True Labs、YGRGames、Zillion 的 5 个缺图已取得原站素材。Casino Quick games 的 Mummy’s Mines 平板图已补。最终捕获中的空素材 img 引用只剩 Betwave：25 次，是 5 张动态图片在五尺寸重复计数。
- 清理原站加载时保存的 game-card-placeholder 卡片和 footer skeleton，避免离线永远出现空白加载卡。保留已观察游戏卡片；这是有限捕获目录，不能把原站 14000 多游戏的标示当成本地内容完整。
- 整合 scripts/audit-update.py、scripts/local_mask_assets.py，并新增 scripts/build-account-dialogs.py、scripts/motion-check.cjs。重新生成保留 motion/account 引用；共享行为仍由 common.js 维护。搜索输入仅保留公开示例 jet，账户表单字段不保留个人填写内容。

### 动画完成内容与维护位置

js/motion.js 与 css/motion.css 负责交互反馈，js/common.js 负责在实际动作时调用：

| 动作 | 完整模式 | 减少动态效果／键盘 |
| --- | --- | --- |
| 桌面弹窗开／关 | 250ms，opacity + scale .96 | 系统减少动态效果为 125ms opacity；键盘即时 |
| 手机弹窗开／关 | 250ms，从底部进入／退出 | 同上，不发生位移 |
| 手机侧栏菜单 | 250ms 横向滑入／滑出，支持打断 | 同上；Esc 即时关闭 |
| 按钮按压 | 160ms，scale .97 | 减少动态效果或键盘不缩放 |
| 页脚展开／收起 | 200ms，测量实际高度 | 减少动态效果／键盘即时 |
| 本地提示 | 200ms 淡入与短位移，连续提示复用同一节点 | 减少动态效果为 125ms opacity |
| 首页轮播 | 手动切换 250ms；自动轮换保留 6.5 秒间隔 | 减少动态效果停止自动轮换、手动即时；hover / focus / 页面隐藏 / 弹窗期间暂停 |

优先使用 transform / opacity；页脚高度是有实际展开目的的例外。没有给赔率、余额、人数或游戏列表加假数据跳动。手机不依赖 hover。动画切换和键盘操作能取消正在进行的动画。

本轮两个浏览器实际 prefers-reduced-motion 都是 true，因此实际视觉验收是 125ms 淡入和无位移模式。完整 250ms 位移动画通过独立调度检查，但在允许完整动态效果的真实浏览器中的视觉验收仍待补；没有擅自改变用户系统偏好。

### 验收结果与证据

- 31 个 HTML 在 390 与 1920，guest / auth 两种预览各检查一次：124 次。随后修复复查，加上搜索三页五尺寸验证，总计 157 条记录、142 个不同“文件／预览／宽度”组合。数据在 qa/final-page-audit.json；保留早期失败并用最新同组合结果取代，不能只看旧行。
- 最新组合检查没有横向溢出、没有 plug 占位图标。Search / Search results / Providers 五种尺寸两种预览均无破图；Sports live 和 Quick games 修复后复查无破图。Betwave auth 的 5 张动态图片仍缺失，已单独记录。
- 全目录本地文件引用缺失 0、可主动导航／加载的远程 src/href 引用 0：qa/expanded-static-qa.json。data:, 是缺素材标记，不应计为成功图片。
- 语法检查 common.js、motion.js 通过；scripts/motion-check.cjs 检查桌面／手机帧、快速打断、减少动态效果及键盘取消通过。独立检查不替代完整模式真实视觉验收。
- 实际操作检查：登录弹窗打开关闭、账户 Settings、430 手机弹窗、缩放保留弹窗、手机菜单、Esc、Enter、页脚 Information 展开。键盘关闭弹窗后，若侧栏仍开，页面继续保持滚动锁定。
- 账户扫描 qa/delivered-privacy-check.json：交付 HTML / 状态 / 新参考不包含用户提供的邮箱或凭证查询。截图只包含匿名示例。
- 截图：qa/home-icons-final.png、qa/animation-login-desktop.png、qa/animation-settings-mobile.png、qa/mobile-menu-animation.png。qa/original-local-page-comparisons.json 是 24 普通页面桌面结构对照，不能当作逐像素一致证明。

### 仍未完成（下一次直接接这里）

1. **Betwave auth：5 张动态图片**（一张公开头像、4 张队徽）未取得；再次查看原站时其 CDN 图片也有加载失败，不用不相关图片替代。不同日期公共 feed 会变化，应再次采集并核对人物／队伍对应。
2. **详情与过滤行为**：Live Casino 的 16 个次级分类、供应商点击后的真实列表、体育筛选／赛事详情、Tournaments 筛选／Show more、活动详情、FAQ、币种／地区等仍没有完整状态与行为覆盖。标为有限设计预览，不是假装所有按钮已完成。
3. **有限目录与搜索**：本地只过滤已观察卡片，没有完整原站游戏数据库或无限加载；实际游戏启动仍属原服务。
4. **全尺寸逐像素审查**：所有现有入口已检查上述资源与布局，但并未对所有页面／状态做全高度逐像素一致验收；部分旧 guest 五尺寸内容仍来自此前记录，应继续逐项更新。
5. **完整动画真实视觉验收**：当前系统减少动态效果为 true，只实际验证了淡入模式；完整位移有调度检查，尚缺真实浏览器运动过程审查。
6. **file:// 双击最终显示**：字体和 mask 已嵌入、路径已经检查；浏览器明确禁止 file://，未绕过，真实双击视觉仍待确认。HTTP 成功不能写成 file:// 已通过。
7. **原站范围**：Markets / Forum / Cockfights / Trading / Poker、真实支付／投注／资料修改等不属于已完整实现页面，现有入口保持本地提示或不跳转；不得新增广告或域外采集。
8. **维护资料与旧 ZIP**：整合捕获的原始输入仍依赖外部 audit-staging 与此前 1win-clone；交付参考已本地化，但重新采集／重建的可移植输入整理尚未完成。目录外旧 ZIP 没有更新，不包含最新修改。

### 下次维护流程

先读本段和 qa/final-page-audit.json。通过 start-preview.cmd 启动本机服务；直接编辑共享行为／动画时不会覆盖参考内容。修改页面布局时同步对应 js/<page>.js 和 js/<page>-auth.js 的各尺寸状态，避免 resize 后恢复旧版。新捕获整合用 scripts/audit-update.py，再按需要运行 scripts/build-account-dialogs.py <capture-folder>；账户捕获必须先匿名化。运行 `node scripts/motion-check.cjs js/motion.js` 检查动画调度，再检查真正操作、快速反向点击、键盘、尺寸切换和系统减少动态效果。最后更新本文已完成与未完成状态。

本轮参考访问始终保持 one-vv3591.com；素材仅来自在该站观察到的内容资源。没有打开广告链接，没有输入密码、投注、付款、修改真实账户或退出用户登录。

收尾确认：临时本机服务已停止，内置浏览器控制列表中的自建标签已全部关闭；Chrome 原站已回首页且仍登录。Chrome 尺寸 reset 调用已成功。内置浏览器尺寸恢复在关闭标签的清理过程中已调用，但最后复读返回标签已关闭，未能再读取最终窗口尺寸；不可把这当成再次测量确认。没有修改系统减少动态效果偏好。最新引用检查工具已保存在 scripts/verify-local-references.py。

## 2026-10-14 接续、规则更新与首页 banner 修复（最新检查点）

### 接续来源与规则

- 已读取本文件全部历史和最新待办、用户附件完整 prompt。六条 AI Reasoning & Execution Strategy 已原文加入“工作约定”之后；新增阶段证据、五尺寸截图、禁止凭空替代和推理设置说明。完整附件在 reference/PROJECT-PROMPT.md。
- 本次找到的实际项目是 C:\Users\vince\OneDrive\Desktop\website\1win，已有 31 个 HTML。当前聊天工作目录原为空；从实际项目复制最新内容进行修改和验收，不使用旧 ZIP 或早期准备包恢复。仅本轮变更同步回上述实际项目，原有素材、页面及 Git 状态不重建。

### 用户插入的优先事项：首页 banner 未铺满

- 用户截图中 VIP CLUB 右侧露出相邻图片。只读原站浏览器测量确认：原站轮播应铺满其 banner 容器。
- 原因：js/common.js 的 fitBanners 将容器的可见宽度写回位于 scaler 内的 slide。可见宽度已经包含外层 scale，slide 又被缩放一次，卡片尺寸与图片尺寸不一致；下一张卡片因而侵入当前视图。
- 1440×900 实际测量：banner 宽 712.875px，原站内部 slide 为 840px，scale 0.848633，显示宽 712.852px；旧本地 slide 被写为 713px，实际显示仅 605.075px。
- 修改：先更新 scaler，再以 wrapper.clientWidth 的未缩放画布宽度计算每张 slide 和位移。保留原站图片、比例、圆角、间距与样式，不拉伸或生成替代素材。
- 验证：五指定尺寸 × guest/auth，共 10 组均铺满、左侧对齐、没有相邻 slide 侵入、无横向溢出。连续缩放另检查 1590、1110、820、768、430、390、1440、1920；五张桌面游客 slide 都逐项验证了尺寸、对齐及前后循环。
- 1920 原站首次采样为尚未稳定的尺寸，保留在 home-banner-browser-qa.json，不作为最终基准；home-reference-settled-1920.json 补记稳定后原站 slide 宽 1034.455px、容器宽 1034.469px。
- evidence：qa/resume-2026-10-14/home-banner-browser-qa.json、home-banner-resize.json、home-banner-navigation.json、home-vip-banner-fixed.png。宽度验收容差 1px，包含浏览器小数像素取整；这是 banner 几何验证，不是全首页逐像素通过。
- auth 1920 现有状态使用 343×165 设计画布，本轮只确认它能铺宽；该捕获与原站当前 auth 布局的一致性仍需重新采集检查。不得将 guest 对照当 auth 原站对照。

### 本轮接续 Betwave 的发现与局部修复

- 原站公开 feed 已随日期变化；旧 auth 缺图对应 mikhail lazarev、Lens、Sporting CP、RB Leipzig、PSV Eindhoven，当前公开 feed 未包含这些旧项。没有拿其他人物或球队的图片填补，5 张旧缺图仍 pending。
- FAQ 的七项答案原本已存在保存 DOM 中，只缺行为。原站允许多项同时展开。common.js 使用原站 accordion / heading / body 的 isOpen 类接通，不重写视觉样式；补 Enter/空格、aria-expanded / aria-controls，跨尺寸保留已展开项与焦点。
- 发现 Betwave 桌面根容器被共享 #root 样式覆写为 column，主内容被侧栏遮挡、文字换行错误。css/local.css 在桌面范围为 Betwave 恢复 row；没有修改其他页面的根容器。
- FAQ 已完成的对照：1920/1440 的 guest/auth 七项内容、字体、坐标、宽度和展开高度与公开参考一致；768 与 390 的 guest 对照一致。FAQ 开关、多项展开、Enter/空格和 1440→768 后展开与焦点保留已实际验证。
- FAQ 未完成：768 auth 的保存布局仍有差异（16 项指标差异）；390 auth 保留了桌面侧栏，导致 FAQ 中心点超出可视区域，浏览器操作未通过；430 与其余 auth 手机截图未完成。这是待修复问题，不能将无破图或静态检查通过写成手机版已通过。
- qa/resume-2026-10-14/faq-browser-qa.json、faq-comparison.json、faq-keyboard-resize.json 和原站／本地 FAQ 截图记录覆盖范围。截图不同像素仍存在，不能据指标一致宣布 100% 一致。某些初次 screenshot clip 未正确裁切，最终有效区域由 full-page 截图和 DOM 坐标裁切得到。

### 最终检查与下一接续点

- common.js 语法通过；motion-check 调度检查通过；31 HTML 与所有保存状态的本地引用缺失 0、主动远程引用 0。verify-local-references.py 新增 --date，避免新验收沿用固定旧日期；本次日期 2026-10-14。
- 当前插入的首页 banner 宽度问题已修复并验证；截图对应的 VIP 图片保持原始比例，右侧不再露出相邻图片。
- 下一步先修 Betwave auth 平板／手机侧栏与布局捕获，再补 FAQ 五尺寸两种预览全验收及像素差异；随后回到上节的动态素材、次级详情／筛选、全站视觉与 file:// 待办。
- 原 Chrome 连接本轮连续超时；公开调查改用内置浏览器。没有操作真实账号、投注、支付或安全设置；旧 auth 原站会话未用于本轮采集。
- 本轮不更新旧 ZIP，不宣称全站完成。服务与临时浏览器尺寸在收尾恢复／停止；若关闭动作失败，应另行补记，不能写成已确认。

收尾确认（2026-10-14）：本轮 8 个变更文件和 qa/resume-2026-10-14 证据已同步到用户指定目录，8 个文件逐一哈希核对一致。修改前版本保存在该证据目录的 original-files/。内置浏览器尺寸 reset 成功，自建调查及测试标签已关闭，临时服务已停止。

## 2026-10-14 首页收起侧栏精确对照（最新检查点）

用户指定图 1 为原站、图 2 为本地，要求修复收起侧栏差异。本轮按原站实际浏览器的稳定 compact 状态检查，修改同步回 C:\Users\vince\OneDrive\Desktop\website\1win。

### 发现、原因与修改

- 原 js/sidebar.js:compact 保存了收起动画过程中的 v-leave-from / fadeLeaveActive 社交按钮。大号 WhatsApp / Telegram 列表没有切换到原站四格预览，社交区高度是 36px 而非 48px，连带 Windows 按钮的纵向位置偏移 12px（1440×900 下 679px，应为 667px）。
- compact 模板保留了 Casino 的 base_selected 类；原 applySidebar 只切换 router / aria 类，没有同步实际控制背景色的 selected 类，导致首页 Casino 图标错误高亮。
- 重新保存并本地化原站稳定 compact DOM，替换 js/sidebar.js 的 compact 状态，保留原始 SVG、图片、布局、尺寸与颜色。20 处素材引用复用现有原站资源，没有生成或替换图标。新增 scripts/update-compact-sidebar.py，可从本轮原始证据独立重建 compact 状态；发现过渡类或未映射素材会拒绝保存。
- js/common.js 同步实际 selected 类：首页没有 Casino 高亮，进入 Casino 后才正确选中；保留展开/收起、刷新和导航偏好。
- 四格 Social media 按钮按原站浮层实现打开、关闭按钮、外部点击关闭、Esc、Enter 及焦点恢复。浮层复用已观察的 8 项社交入口，原站位置 64,350、尺寸 308×426（1440×900）；不打开域外链接。收起→展开侧栏时浮层关闭。
- css/local.css 仅针对该浮层恢复原站 11px 滚动条、4px 透明边框与实际颜色，隔离 Betwave 后加载的全局 6px/透明滚动条覆盖。没有改动其他页面的滚动条。
- scripts/verify-local-references.py 增加 SIDEBAR_STATES 检查，覆盖新模板和浮层的真实资源与链接。

### 实际验证与证据范围

- 原站／本地相同窗口下比较完整侧栏及展开按钮的 0..80px 区域：1440×900、1920×1080、1440×680、1024×768，四组像素差异均为 0，所有控件坐标、尺寸和背景色一致。原站在 100% 浏览器尺寸下侧栏为 64px，展开按钮延伸至 80px；没有根据两张裁切图片的显示缩放比例强行改宽度。
- 实际检查展开后宽 280px、再收起、刷新保持 compact、进入 Casino 保持 compact 且选中状态正确，均通过。
- Social media 浮层实测位置／尺寸一致，关闭、Enter 打开、Esc 关闭、焦点回到按钮、展开侧栏时关闭均通过。浮层主体不透明区域逐像素一致；整块截图外缘还有 0.0479/255 的平均通道差异，来自透明圆角／边框下原站与本地的不同首页 banner。不能将其写成整个浮层截图像素差异为 0。
- 语法检查 common.js / sidebar.js 通过；31 个页面及状态／共享模板的 missing_local_files=0、active_external_references=0。
- 证据：qa/sidebar-compact-2026-10-14/ 下 reference-compact.html、reference-social-popover.html、控件指标、原站与本地截图、pixel-comparison-1440.json、pixel-comparison-matrix.json、pixel-comparison-social.json、functional-checks.json、social-functional-checks.json。sidebar-before-after.png 是同尺寸三列对照，未改动截图中的侧栏内容。

本轮完成的是首页 desktop compact 侧栏和已观察社交浮层；不会据此宣布全站或所有登录／手机状态 100% 完成。之前记录的 Betwave auth 平板／手机、全站次级交互、动态缺图与 file:// 验收继续待办。

本轮收尾：社交浮层滚动到 Discord（scrollTop=80）及真实外部空白区域点击关闭复查通过；初次点击目标被浮层遮挡的记录保留在 social-functional-checks.json，不当作最终关闭验证。临时浏览器尺寸 reset 成功、自建原站与测试标签已关闭、预览服务已停止。以下本轮文件和证据按哈希核对同步回用户指定的原项目目录，原文件保存在证据的 original-files/。
