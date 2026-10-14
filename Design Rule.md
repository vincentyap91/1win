# Design Rule — 1win HTML 项目

版本：2026-10-14，Asia/Kuala_Lumpur。交接时先读本文，再读 **Progress Workflow.md**。根目录只有这两份维护文档；历史说明归档在 reference/legacy-docs/，日常维护无需逐份阅读。

## 1. 目标与依据

唯一原站：https://one-vv3591.com/ 。目标是全页面视觉与已观察前端行为最终 100% 一致，属于精确复刻，不是重新设计。当前仍在实施和验收中；未验证的状态不能写成完全一致。

沿用 HTML5、CSS3、Vanilla JavaScript，53 个独立 HTML 入口（含 22 个 Casino 子分类页），共享本地资源和组件。同一页面随窗口尺寸切换，不创建第二套 mobile 页面。页面启动不依赖生产后端，不发布到公网。

证据优先顺序：同状态真实浏览器测量／截图 → 已匿名化原站参考 → 已验证共享组件 → 尚待验证的历史捕获。未观察页面和缺失素材保持待办，不猜布局、不生成替代图片、不换成相似字体／图标。原素材仅在允许访问和使用的范围内复用。

## 2. 实测基础设计系统

以下值来自本轮原站 1440×900 的实测；不同主题、页面和状态应使用对应原变量，不能把一个值无差别套到全站。完整采样证据在 qa/shared-components-2026-10-14/reference-design-tokens.json 与 reference-component-specs.json。

| 设计项目 | 原站值／变量 | 使用规则 |
| --- | --- | --- |
| 主背景 | #141415，--color-background-base-primary | 页面主体 |
| 次背景 | #1D1E20，--color-background-base-secondary | 侧栏／容器等 |
| 第三级背景 | #2E3035，--color-background-base-tertiary | 按组件状态使用 |
| 主文字 | #F0F2F5 | 深色主题 |
| 次文字 | #9AA1B1 | 说明、次级信息 |
| 第三级文字 | #797F8B | 原站指定弱化信息 |
| 首页导航选中 | #0075FF | 仅真实选中的导航项 |
| 注册按钮底色 | #00B24B | 本轮原站按钮实测 |
| 常规正文 | Inter，14px / 20px，400 | 保留原字体及其原 fallback 栈 |
| 半粗正文／导航 | Inter，14px / 20px，600 | 不用浏览器默认粗体代替 |
| 常规导航链接 | 40px 高，8px 16px padding，8px gap，12px radius | 文字宽度由原字体决定 |
| Header 登录／注册 | 44px 高，12px radius | 按实际 view 层背景使用 |
| 通用控件 s / m / l | 32 / 36 / 40px | 页面按钮可能有各自例外 |
| 按钮圆角 s / m | 8 / 10px | 不与 header 的 12px 混淆 |
| 容器圆角 l / xl | 20 / 24px | 按原组件及断点使用 |
| 侧栏展开／收起 | 280 / 64px | 收起按钮可延伸到 x=80px |
| 收起头像／社交预览 | 44×44 / 48×48px | 四格社交预览 padding 5px、gap 2px |
| FAQ 内容间距／内边距 | 16px | 多项可以同时展开 |
| 社交浮层 | 308×426px（1440×900），白色主题 | 位置随触发按钮和窗口调整 |
| 该浮层滚动条 | 11px，thumb 4px 透明边框 | 不继承 Betwave 的全局 6px 规则 |

字体来源见 qa/asset-provenance.json 的 font 项。正文优先原 Inter；Rubik、Coolvetica 等仅用在已观察的对应组件。Logo、菜单 SVG 和 CSS mask 用原资源，不能手绘重做。字体和 mask 已使用原字节／data URL 处理本地兼容性。

本地资源写法（直接双击 HTML 也必须显示）：
- mask 图标（含 `mask-image: var(--x)` 引用的变量）一律内嵌为 data URL：file:// 下 mask 走 CORS 必被拦截。
- 内联 style 中 **CSS 变量**里的图片写 `url("../assets/…")`：浏览器按读取它的样式表（css/）解析，写 `assets/…` 会变成 css/assets/… 而 404。普通 `src`、`srcset` 仍写 `assets/…`。
- srcset 候选之间用 `, `（逗号加空格）；`a.avif,a.avif 2x` 会被当成一个 URL。
- 原站缺失的图保持原样（例如原站本身无 src 的国旗），不补造。

保留原 spacing、padding、gradient、shadow、border 与 CSS 变量；组件的权威样式仍在 css/styles.css / css/audit.css。新修复写入 css/local.css 并限定页面／组件范围。Betwave Read more 使用原 seo_expanded 类、Collapse 文案和 arrow-top 路径；响应式重建保留展开与焦点，不固定内容高度。不能随意覆写全局 #root、header、button 或滚动条，避免标准页面与 Betwave 互相污染。浅色浮层使用其原 colorScheme-light，不套深色文字变量。

## 3. 响应式与图像

必须比较：1920×1080、1440×900、768×1024、390×844、430×932，并测中间宽度。原站实测 CSS 包含 768、1024、1440、1920 的断点；本地状态选择还使用 410、640、1024、1680，后二者不是对原站完整断点的证明，仍需连续缩放验收。

每份窗口状态由 js/<page>.js 和 js/<page>-auth.js 的对应 key 提供页面主体；公共 shell 已替换为共享模板引用。修改响应式内容必须覆盖相应 key，避免 resize 后回到旧状态。

原始图片保持比例、裁切和分辨率；banner 中已印在图片上的标题不能另造字体叠写。轮播内部用未缩放画布的 wrapper.clientWidth 计算 slide 宽度和位移，再由 scaler 缩放；禁止把可见宽度再次写入内部 slide。保留原间距与圆角。

## 4. 共享组件：今后主要改这里

| 修改内容 | 唯一维护位置 | 说明 |
| --- | --- | --- |
| 公共 Header HTML | components/header.html | 完全相同的标记仅保存一次 |
| 公共侧栏／社交浮层 HTML | components/sidebar.html | 展开、收起、页面族、游客／Demo 保留实测变体 |
| 公共 Footer HTML | components/footer.html | 未捕获的 footer 不会被自动编造 |
| 导航和分类映射 | js/routes.js | pages（路由→入口）、categories（主分类标签）、subcategories（Live／Quick 页内的子分类标签，同名标签按当前组解析） |
| 交互、状态切换、菜单、FAQ／Read more | js/common.js | 所有入口共用 |
| 动画／减少动态效果 | js/motion.js、css/motion.css | 功能调度和实际运动验收分开记录 |
| 页面布局修复 | css/local.css | 必须限定作用范围 |
| 登录／注册／恢复弹窗 | js/dialogs.js | 共享弹窗，不复制到每个 HTML |
| Profile / Settings | js/account-dialogs.js、css/account.css | 匿名 Demo 状态 |
| 页面专属内容 | js/<page>.js、js/<page>-auth.js | 公共 shell 不再在这里重复维护 |

组件原文件使用 `<template data-component="组件ID">`。页面／状态使用 `<template data-shared-component="组件ID"></template>`。components/catalog.json 记录每个变体被哪些页面和窗口使用，可在模板文件搜索 ID 定位；它是机器索引，不是第三份必读文档。

共享加载器 js/shared-components.js 将模板还原成真实 DOM，不增加布局 wrapper。不同原站版本保留不同变体，不把 Betwave、Casino 子菜单、游客、Demo 或手机状态强行合并。当前 731 次公共引用集中到 142 个不同的原始变体中；这并不代表已验证了所有变体的原站一致性。

**改组件后只构建一次，不手改各入口或生成 bundle：**

```text
node scripts/build-components.mjs
```

该命令把三份模板编译到 js/components/header.js、sidebar.js、footer.js。使用普通脚本，不用 fetch 或浏览器 ES modules，保持 file: 资源模式可兼容。编译产物随项目交付；用户浏览页面无需额外构建。HTTP 预览启动时也会构建。完整 file:// 浏览器视觉验收仍待完成。

新增／重新采集原始页面后运行：

```text
python scripts/migrate-shared-components.py --date YYYY-MM-DD
node scripts/build-components.mjs
```

迁移只合并逐字节相同的片段，先证明还原完全一致，再写文件。它不会把未捕获内容补成假页面。audit-update.py 与 update-compact-sidebar.py 已接入迁移；重新采集会改变参考内容，之后要重新构建、检查并更新验收状态。local_mask_assets.py 已包含共享 HTML 模板。

## 5. 本地运行与交接

实际交付目录：C:\Users\vince\OneDrive\Desktop\website\1win。复制到另一台机器时复制整个项目，保持 assets、components、css、js、scripts 的相对结构，不只复制 HTML。

- Windows：双击 start-preview.cmd；访问 http://127.0.0.1:4173/。关闭预览窗口停止服务。
- 通用：安装可运行本项目原生脚本的 Node.js，运行 `node scripts/serve.mjs`。不需要 npm 安装或框架。
- Python 仅用于重新采集整合／迁移／静态 QA；图片差异脚本需要 Pillow，属于验收工具，不是页面运行依赖。
- 默认游客。Alt+P 切换 Demo；`?preview=auth` 指定 Demo。本地预览开关不属于原站界面，只在 `?controls=1` 时显示（否则会改变 footer 高度）。`?qa=1` 停止 banner 轮播、Last wins 轮换和倒计时，便于截图。
- 登录后预览只显示 Demo user、ID 00000000、余额 0.00；真实账户、支付、投注、游戏服务不连接。不能收集真实密码或支付信息。

## 6. 验收与维护约束

先调查和保存参考，再提取设计／素材，再实现，再逐尺寸截图比较和功能检查。已经生成、已经捕获、能启动、没有缺图、指标相同、逐像素相同是不同状态。

原站／本地使用同窗口、缩放、滚动、guest/auth、弹窗、菜单和轮播状态。动态赛事、feed、人数、倒计时及旧 banner 内容需要单独对齐或注明差异；不能把它们掩盖成相同。开发附加 Demo 控件不属于原站组件，记录其比较边界。

截图比较以原图为证据，不把截图贴成网页。检查坐标、字体、换行、间距、图片裁切、颜色、边框、阴影、overflow、加载与空状态。点击、键盘、Esc、焦点、滚动、快速反向操作与 resize 都要验证。

基础检查：`node scripts/build-components.mjs`、`python scripts/verify-local-references.py --date YYYY-MM-DD`、`python scripts/apply-footers.py --date <footer 签名表日期>`（unresolved 为空）、`node --experimental-websocket scripts/file-protocol-check.mjs`（file:// 失败请求 0）。修改动画时另跑 `node scripts/motion-check.cjs js/motion.js`。检查 browser console。变更后仅重测受影响的范围，发现回归再扩大，不用重复通过的检查代替推进。

源码恢复检查和迁移前后截图只证明重构保真，不证明对原站已完成。原站百分比只有在完整页面清单和状态分母齐全、所有项有证据时才报告。具体缺口与下一步只写 Progress Workflow.md。

## 7. AI Reasoning & Execution Strategy

Prioritize accuracy and visual fidelity over speed.

Use deeper analysis for website investigation, design-system extraction, complex interactions, debugging, and pixel-perfect visual QA.

For straightforward and repetitive implementation tasks, work efficiently while preserving the established design rules.

Never reduce visual quality to save reasoning effort.

Complete and verify each implementation phase before proceeding to the next.

If a task requires more reasoning, report the issue and recommend increasing the reasoning level when necessary.

需要更深推理时说明具体问题，不声称已自行更改模型设置；不以速度或 token 为由降低质量。不可访问状态明确记录阻碍，继续处理已可观察事项。
