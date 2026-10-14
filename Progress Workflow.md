# Progress Workflow — 1win

最新更新：2026-10-14（Asia/Kuala_Lumpur）。**这是唯一的进度看板**：先看「总览」和「下一步」，规则和代码约定只查 **Design Rule.md**。旧版进度文档已归档在 reference/legacy-docs/2026-10-14/。

## 1. 目标

从 0 到 1 复刻 https://one-vv3591.com/：全部页面的**视觉与已观察到的前端功能 100% 一致**。整站用 HTML5 + CSS + 原生 JS；相同的部件（header、侧栏、footer 等）只维护一份，被所有页面共享引用。

> 现在**还没有达到全站 100%**。原站还有未调查的路由（见第 5 节），所以不给全站完成百分比；下面只报告逐项、可验证的状态。

## 2. 总览（2026-10-14）

| 指标 | 现状 | 说明 |
| --- | --- | --- |
| HTML 入口 | **53** 个 | 原 31 个 + 新增 22 个 Casino 子分类页 |
| 页面状态 | **500** 份 | 50 个内容页 × 游客／Demo × 5 个尺寸（1920／1440／768／430／390） |
| 共享组件 | 146 个原样变体，被引用 **1,659** 次 | header／侧栏／footer 只在 components/*.html 维护 |
| Footer | **500／500** 份状态都有，且与原站逐路由逐尺寸签名一致 | 之前 181 份缺失 |
| 直接双击打开（file://） | 53 个入口：失败请求 **0**；破图仅 1 处，与原站相同（Live Roulette 某卡国旗原站即无地址） | Chrome 无头模式实测，见第 4 节 |
| 本地资源检查 | 缺失本地文件 0、主动外部引用 0 | `verify-local-references.py` |
| srcset 格式 | 23,164 处，错误 **0** | 修复 112 处会导致破图的写法 |
| 字体 | 353 个缺失字体子集已补齐 | 西里尔、希腊、越南等字符不再回退 |

图例：✅ 已对照原站验证　🟡 已实现、部分验证　⬜ 未做／缺参考

## 3. 页面看板

「游客」「Demo」= 页面主体内容；「功能」= 该页隐藏交互是否对齐。Demo 参考来自用户在内置浏览器里自行登录的原站会话（我不输入任何凭据）。

### Casino 系列

| 原站路径 | 本地入口 | 游客 | Demo | Footer | 功能 | 备注 |
| --- | --- | --- | --- | --- | --- | --- |
| /casino | casino.html | ✅ | ✅ | ✅ | 🟡 | 10 行游戏 + Last wins + All games + SEO，5 尺寸行高与原站逐项一致 |
| /casino/live-games | casino-live.html | ✅ | 🟡 | ✅ | 🟡 | Demo 主体用游客抓取（原站子分类内容游客／登录相同） |
| /casino/live-games/<15 个子类> | casino-live-*.html | ✅ | 🟡 | ✅ | ✅ 标签跳转 | 1win-live、evolution、roulette … poker，全部新建 |
| /casino/fast-games | casino-quick.html | ✅ | 🟡 | ✅ | 🟡 | 同上 |
| /casino/fast-games/<7 个子类> | casino-quick-*.html | ✅ | 🟡 | ✅ | ✅ 标签跳转 | 1win-games、crash-games … lotteries |
| /casino/ai-recommendations | casino-recommended.html | ✅ | 🟡 | ✅ | 🟡 | 原站游客访问会重定向到 /casino，游客版按此用 /casino 内容 |
| /casino 搜索／结果／供应商浮层 | casino-search*.html、casino-providers.html | ✅ 底层 lobby | ✅ 底层 lobby | ✅ | ⬜ | 浮层本身的行为尚未逐项对照 |
| /casino/slots、1win-games、bonus-buy、bonus-wagering、fishing-games、jili-games、new、only-on-1win | casino-slots.html 等 8 个 | 🟡 | 🟡 | ✅ | 🟡 | 已删掉原站加载后会消失的 SEO 骨架；无限滚动未实现 |

### 其他页面

| 原站路径 | 本地入口 | 游客 | Demo | Footer | 功能 | 已知缺口 |
| --- | --- | --- | --- | --- | --- | --- |
| / | index.html | 🟡 | 🟡 | ✅ | 🟡 | banner 已修复；已删除空 SEO 骨架 |
| /betwave | betwave.html | 🟡 | 🟡 | ✅ | 🟡 | Read more、430 FAQ 已验收；约 57 个骨架、25 个动态头像／队徽 |
| /blog | blog.html | 🟡 | 🟡 | ✅ | ⬜ | |
| /bonuses | bonuses.html | 🟡 | 🟡 | ✅ | ⬜ | |
| /freemoney | freemoney.html | 🟡 | 🟡 | ✅ | 🟡 | Demo 有 1 个 lucky-drive 骨架 |
| /loyalty-program、/vip-club | 2 个 | 🟡 | 🟡 | ✅ | ⬜ | |
| /promotions | promotions.html | 🟡 | 🟡 | ✅ | ⬜ | 10 个活动卡占位 |
| /tournaments | tournaments.html | 🟡 | 🟡 | ✅ | ⬜ | 筛选、Show more |
| /betting、/live、/prematch、/esport | sports*.html | 🟡 | 🟡 | ✅ | ⬜ | 约 100 处体育样式变量图为空占位 |
| 登录／注册／找回密码 | login／register／recovery.html | 🟡 | — | ✅ | 🟡 | 语言选择器 30 个国旗缺失 |

## 4. 本轮完成（2026-10-14）

| 工作 | 结果 | 证据 |
| --- | --- | --- |
| Casino 懒加载版块 | 旧采集没滚到触发点，Bonus buy 等 6 行是空占位、Last wins 是骨架（1440 中部约 1,500px 空白）。已用原站同一时刻的完整 lobby 刷新 casino 游客＋Demo 5 尺寸；Live、Quick、AI 推荐、三个浮层页同法处理 | qa/lazy-sections-2026-10-14/casino/casino-audit.json 等 |
| Casino 隐藏功能 | ① Last wins 每 3 秒轮换（左侧滑入、transform 1s，位置 328/556/784/1012/1240 与原站一致）② 锦标赛倒计时每秒递减（D:HH:MM:SS）③ 游戏行左右箭头每次翻 3 张卡（原站 401px）④ 分类标签条左右箭头：按宽度翻页，在头／尾自动隐藏对应箭头（与原站 504px、显隐一致）⑤ 11 个主分类、15 个 Live 子类、7 个 Quick 子类、3 个预设按钮全部可点击跳转并高亮 | js/common.js（initLastWins、initCountdowns、initScrollViews、预设／分类点击） |
| 桌面侧栏展开／收起（共享） | 一套共享逻辑覆盖全部 50 个桌面页面：收起后侧栏 280→64、内容左移，刷新／跨页记住状态（原站用 cookie compact_sidebar，本地用 localStorage），再展开完全复原。新增 Betwave 专属收起模板（原站 Betwave 用另一套侧栏），内容区 328↔112 与原站一致 | qa/sidebar-toggle-2026-10-14/report-1440x900.json、scripts/sidebar-toggle-check.mjs |
| 游戏行加载更多 | 原站每行初始 8 张，翻页时懒加载到 20–24 张。改为"每行翻到底再复位"抓取，Casino／Live／Quick 三个 lobby 5 尺寸全部刷新，本地每行张数与原站一致，复位后箭头状态（后退禁用、前进可用）正确 | qa/lazy-sections-2026-10-14/casino*/ |
| View all 与行标题 | 原站每行 "View all" 和行标题进入该行分类页（Slots→/casino/slots 等）；本地原来一律回 casino 页，已按行标题匹配同名分类标签跳转 | js/common.js rowCategory |
| 22 个子分类页 | 新建 casino-live-*／casino-quick-* 共 22 个入口，5 尺寸游客＋Demo，内容来自原站；路由写入 js/routes.js 的 subcategories | qa/lazy-sections-2026-10-14/casino-live-*／casino-quick-* |
| 全站 footer | 原站 footer 也是懒挂载。逐路由×5 尺寸量出签名：每个路由桌面一种、平板／手机一种，全部命中现有模板；补 201 处、纠正首页 1920 用错的手机版 footer | qa/footer-2026-10-14/footer-signatures.json、apply-report.json |
| 开发控件 | 「本地预览：未登录／登录后预览」按钮原本插在 footer 里，使每页 footer 高 65px；改为只在 `?controls=1` 时显示（Alt+P、`?preview=auth` 照常可用）。footer 现为原站 665×1640（1920） | js/common.js addPreviewControl |
| 直接打开 HTML 图标／图片消失（第 5 点） | 根因三个：① 内联 style 里 CSS 变量的 `url("assets/…")` 被浏览器按 css/ 目录解析成 css/assets/…（**HTTP 预览下也 404**），共 40 处改为 `../assets/`；② mask 图标走 CORS，file:// 必被拦截，126 处改成内嵌 data URL；③ srcset 写成 `a.avif,a.avif 2x` 被当成一个 URL，112 处修正。修复后 53 个入口 file:// 下失败请求 0（唯一破图与原站相同） | qa/file-protocol-2026-10-14/report-1440x900.json |
| 字体与 CSS 占位 | 补齐 353 个字体子集并去除 2,543 个重复 @font-face；恢复彩票格子、步骤卡完成态、锦标赛票券 SVG（含滤镜）等 11 处被替换成 `data:,` 的背景 | qa/fonts-2026-10-14/fill-report.json |
| 空 SEO 骨架 | 首页、8 个类别页和 Quick games 的 SEO 位置原站加载后为空，删除本地残留骨架 | qa/seo-skeleton-2026-10-14/ |
| 早前 | 公共组件抽取、Betwave Read more 五尺寸、Betwave 430 FAQ 七项、首页 banner、compact 侧栏与社交浮层 | qa/shared-components-2026-10-14 等 |

## 5. 待办（按优先级）

| 优先级 | 项目 | 具体内容 | 完成标准 |
| --- | --- | --- | --- |
| P0 | Casino 浮层 | 搜索输入、结果、供应商列表的打开／筛选／关闭、键盘与 Esc；casino-search 仍有 4 个空卡 | 与原站逐步操作对照 |
| P0 | 游戏卡交互 | 悬停效果、点击游戏（游客会弹登录？）、Game of the week 的 Play、View all 去向 | 先在原站观察，再实现 |
| P0 | 类别页无限滚动 | 原站滚到底每次再加载 27 张；本地是固定列表 | 预抓多页数据，滚动时依序显示 |
| P1 | 其余 Demo 参考 | casino-1win／new／fishing 等 Demo 仍有少量占位；其他页面 Demo 布局未用新参考核对 | 需原站登录会话（用户自行登录） |
| P1 | 缺失图片 | 语言选择器 30 个国旗（原站路径 /resources/v1/shared/images/languages/*.svg）；体育页约 100 处变量图；Betwave 25 个动态头像／队徽 | 从原站取回，不用相似图替代 |
| P1 | Promotions、Betwave 骨架 | 10 个活动卡占位、约 57 个 Betwave 骨架 | 抓取加载后的版块替换 |
| P1 | Sports、Tournaments、活动页功能 | 筛选、赛事详情、投注单本地展示、Show more | 不提交真实投注 |
| P1 | 全高度像素对比 | 所有入口 5 尺寸逐项截图对比 | 动态内容单独标注 |
| P2 | 未覆盖路由 | Markets、Forum、Cockfights、Trading、Poker；Betwave 子页；游戏／供应商／赛事／活动详情 | 先列出清单与分母 |
| P2 | 打包 | 目录外旧 ZIP 不是最新版 | 验收后重新打包 |

## 6. 下一步

1. Casino 搜索／供应商浮层逐项对照（输入、结果、筛选、Esc、关闭）。
   已观察（1440 游客）：点击 casino-search-input-button 后浮层在 /casino 上打开（URL 不变），输入框自动聚焦、placeholder "Search"；Games／Providers 两个标签（Games 默认选中）；内容为 1win games、Live casino、Quick games 三行共 18 张卡。下一步：抓取浮层原始标记（5 尺寸）、输入后的结果、Providers 标签与 Esc／关闭，与本地 casino-search*.html 对照。
2. 游戏卡悬停／点击、Game of the week 的 Play 行为对照。
3. 类别页无限滚动。
4. 其余页面懒加载占位（Promotions、Betwave）与缺失图片（国旗、体育变量图）。

## 7. 每次开工流程

1. 读本文第 2、5、6 节；规则查 Design Rule.md。
2. 启动预览：双击 start-preview.cmd 或 `node scripts/serve.mjs`（4173 被占用时内置浏览器会改用 4174）。
3. **原站取证**：内置浏览器里把原站标签页置于前台（后台标签的计时器和平滑滚动会被节流）；滚动用 `behavior:'instant'`（原站 `scroll-behavior: smooth`）；原站是前端路由，可用 `$router.push(path)` 免整页刷新。原站页面不能访问本机网络，大段 DOM 通过 javascript_tool 返回值落盘（tool-results/*.txt），并用页面内 SHA-256 校验。
4. 改动位置：共享部件改 components/*.html 后 `node scripts/build-components.mjs`；懒加载内容用 `scripts/patch-lazy-sections.py`；footer 用 `scripts/apply-footers.py`；新增或重抓状态后运行 `scripts/migrate-shared-components.py`。
5. 检查（全部要过）：`build-components.mjs`、`verify-local-references.py`、`fix-variable-urls.py`（应为 0）、`local_mask_assets.py`（应为 0）、`apply-footers.py`（unresolved 为空），以及 `node --experimental-websocket scripts/file-protocol-check.mjs`（file:// 失败请求 0）。再做同条件截图、点击、键盘、resize、console 检查。
6. 只更新本文：完成项、证据、待办、下一步。规则变化才改 Design Rule.md。
7. 收尾：停止预览服务、恢复浏览器尺寸。

## 8. 工具脚本

| 脚本 | 用途 |
| --- | --- |
| scripts/capture_clean.py | 清洗原站 DOM 片段（链接、图片本地化、变量 url、srcset），下载缺失图片并登记 qa/asset-provenance.json |
| scripts/patch-lazy-sections.py | 用原站抓取替换页面状态中的 lobby／游戏行／Last wins／footer（`--auth` 处理 Demo） |
| scripts/apply-footers.py | 按 qa/footer-*/footer-signatures.json 给每个状态挂正确的 footer 模板 |
| scripts/create-subcategory-pages.py | 生成 Live／Quick 子分类入口并登记路由 |
| scripts/drop-empty-seo-skeleton.py | 删除原站加载后为空的 SEO 骨架 |
| scripts/fill-missing-fonts.py、fix-css-placeholders.py | 补字体子集、恢复 CSS 中被占位的背景 |
| scripts/fix-srcset-separators.py、fix-variable-urls.py、local_mask_assets.py | 修 srcset、变量 url、mask 内嵌（file:// 兼容） |
| scripts/file-protocol-check.mjs | 用本机 Chrome／Edge 无头模式以 file:// 打开全部入口，报告失败资源和破图 |

## 9. 证据目录

- qa/lazy-sections-2026-10-14/<页面>/：原站抓取（reference/）、补丁报告、修改前备份（backup/）。casino/casino-audit.json 是 Casino 审核总结。
- qa/footer-2026-10-14/：footer 签名表与应用报告；qa/file-protocol-2026-10-14/：file:// 报告与截图；qa/fonts-2026-10-14/、qa/srcset-fix-2026-10-14/、qa/seo-skeleton-2026-10-14/：对应修复的报告与备份。
- 早前：shared-components-2026-10-14、sidebar-compact-2026-10-14、resume-2026-10-14、betwave-faq-430-2026-10-14。

参考说明：Last wins 中其他玩家已打码的标识，首字符统一改为 u；Demo 状态里姓名→Demo user、ID→ID 00000000、余额→0.00。动态内容（banner 顺序、赛事、在线人数、中奖流）随抓取时间变化，不计为差异。
