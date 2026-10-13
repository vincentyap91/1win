# 1win 项目流程与维护记录

最后更新：2026-10-13（Asia/Singapore）。本文件为后续维护的首要交接记录。以下保留阶段历史，最新结果和待办以末尾“扩大检查后的最新记录”为准。

## 工作约定

- 唯一实际编辑目录：`C:\Users\Vincent\OneDrive\Desktop\1win\1win-html-project`。
- 唯一设计参考：`https://one-vv3591.com/`。只调查此站内容，不打开广告或跳出此域名。
- HTML / CSS / Vanilla JavaScript；各页面独立 HTML，共用 assets、css、js；同一页面调整浏览器宽度显示手机布局，不建立独立 mobile 目录。
- 用户已选择：默认保留未登录界面，提供登录后预览切换。登录后本地显示 Demo user、ID 00000000、余额 0.00，不连接真实账户。
- 用户允许对照其 Chrome 已登录页面。只查看设计，不改账户、不充值、不投注。
- 每次维护追加：发现 → 原站证据 → 原因 → 修改文件 → 验证 → 未完成项。已捕获、已实现、已对照、已测试是不同状态；不宣称全站 100% 完成。
- ChatGPT 项目 sources/ 是只读参考。旧工作目录和旧 ZIP 不代表当前交付版本，不覆盖本目录现有修复。

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
