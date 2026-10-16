# Design Rule — 1win HTML 与可编辑 Figma

版本：2026-10-15，Asia/Kuala_Lumpur。交接时先读本文，再读 **Progress Workflow.md**。根目录只有这两份维护文档；历史说明归档在 reference/legacy-docs/，日常维护无需逐份阅读。

## 1. 目标与依据

唯一原站：https://one-vv3591.com/ 。目标是全页面视觉与已观察前端行为最终 100% 一致，属于精确复刻，不是重新设计。当前仍在实施和验收中；未验证的状态不能写成完全一致。

沿用 HTML5、CSS3、Vanilla JavaScript，31 个独立 HTML 入口，共享本地资源和组件。同一页面随窗口尺寸切换，不创建第二套 mobile 页面。页面启动不依赖生产后端，不发布到公网。

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
| 导航和分类映射 | js/routes.js | 页面与分类统一读取此配置 |
| 交互、状态切换、菜单、FAQ／Read more | js/common.js | 所有入口共用 |
| 动画／减少动态效果 | js/motion.js、css/motion.css | 功能调度和实际运动验收分开记录 |
| 页面布局修复 | css/local.css | 必须限定作用范围 |
| 登录／注册／恢复弹窗 | js/dialogs.js | 共享弹窗，不复制到每个 HTML |
| Profile / Settings | js/account-dialogs.js、css/account.css | 匿名 Demo 状态 |
| 页面专属内容 | js/<page>.js、js/<page>-auth.js | 公共 shell 不再在这里重复维护 |

组件原文件使用 `<template data-component="组件ID">`。页面／状态使用 `<template data-shared-component="组件ID"></template>`。components/catalog.json 记录每个变体被哪些页面和窗口使用，可在模板文件搜索 ID 定位；它是机器索引，不是第三份必读文档。

共享加载器 js/shared-components.js 将模板还原成真实 DOM，不增加布局 wrapper。不同原站版本保留不同变体，不把 Betwave、Casino 子菜单、游客、Demo 或手机状态强行合并。当前 731 次公共引用集中到 142 个不同的原始变体中；这并不代表已验证了所有变体的原站一致性。

**改组件后只构建一次，不手改 31 个入口或生成 bundle：**

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
- 默认游客。Alt+P 或现有本地预览开关切换 Demo；`?preview=auth` 指定 Demo。`?qa=1` 停止自动轮播便于截图，它不等同隐藏全部开发附加界面。
- 登录后预览只显示 Demo user、ID 00000000、余额 0.00；真实账户、支付、投注、游戏服务不连接。不能收集真实密码或支付信息。

## 6. 验收与维护约束

先调查和保存参考，再提取设计／素材，再实现，再逐尺寸截图比较和功能检查。已经生成、已经捕获、能启动、没有缺图、指标相同、逐像素相同是不同状态。

原站／本地使用同窗口、缩放、滚动、guest/auth、弹窗、菜单和轮播状态。动态赛事、feed、人数、倒计时及旧 banner 内容需要单独对齐或注明差异；不能把它们掩盖成相同。开发附加 Demo 控件不属于原站组件，记录其比较边界。

截图比较以原图为证据，不把截图贴成网页。检查坐标、字体、换行、间距、图片裁切、颜色、边框、阴影、overflow、加载与空状态。点击、键盘、Esc、焦点、滚动、快速反向操作与 resize 都要验证。

基础检查：`node scripts/build-components.mjs`、`python scripts/verify-local-references.py --date YYYY-MM-DD`。修改动画时另跑 `node scripts/motion-check.cjs js/motion.js`。检查 browser console。变更后仅重测受影响的范围，发现回归再扩大，不用重复通过的检查代替推进。

源码恢复检查和迁移前后截图只证明重构保真，不证明对原站已完成。原站百分比只有在完整页面清单和状态分母齐全、所有项有证据时才报告。具体缺口与下一步只写 Progress Workflow.md。

## 7. AI Reasoning & Execution Strategy

Prioritize accuracy and visual fidelity over speed.

Use deeper analysis for website investigation, design-system extraction, complex interactions, debugging, and pixel-perfect visual QA.

For straightforward and repetitive implementation tasks, work efficiently while preserving the established design rules.

Never reduce visual quality to save reasoning effort.

Complete and verify each implementation phase before proceeding to the next.

If a task requires more reasoning, report the issue and recommend increasing the reasoning level when necessary.

需要更深推理时说明具体问题，不声称已自行更改模型设置；不以速度或 token 为由降低质量。不可访问状态明确记录阻碍，继续处理已可观察事项。


## Figma 页面唯一性与复用规则

**用户最新指示（2026-10-15）优先：已经完成的设计 Frame 全部保留，不再删除、合并或改名为其他页面。相同布局的复用规则只约束后续新增工作；已有设计即使同布局也不清理。中断期间已生效的移除操作要先恢复，再继续剩余页面和弹窗。**

- 后续新增前，按路由、响应式尺寸与实质状态查重；已完成 Frame 全部保留。桌面 1440 与手机 390 属于不同响应式版本；菜单／弹窗等实质差异使用组件变体或独立面板表达。
- 修改已有设计必须更新原 Frame，保留原节点 ID，不创建另一份整页设计。先查询现有页面与进度账本，再决定是否真的缺少设计。
- 捕获参考、临时导入、组件化版本、轮播图片变化或动态数字变化都不构成新页面。参考截图／原始捕获保存到本地 QA，不留第二份整页设计在 Figma 画布。
- 相同按钮、图标、卡片、导航和页脚使用已有组件实例。只有观察到结构或状态差异时才增加组件变体，不能重复创建同一组件。
- 迟到的捕获结果若与已有设计重复，先把必要内容更新到保留的 Frame，再移除临时 Frame；不得删除唯一设计或其共享组件依赖。
- 每次收尾记录保留的节点 ID、后续新增的布局覆盖与当前未验收范围；不得以整理或去重为由移除已完成设计。


### Figma 捕获完整性与网格组件（2026-10-15）

捕获完成不等于页面内容完整。必须检查页面底部：游戏卡片、真实文案、页尾、版权和底部导航；加载骨架或空占位不得作为完成版本。发现源快照缺失时，依据原站证据在同一个 Frame 内补齐，公共页尾使用已有组件实例。

不同卡片结构分别复用已有变体（轮播、网格、Live 标记、手机），不只按图片数量猜测类型。替换网格子节点时保留行列位置、网格行数、尺寸和 sizing；新增实例可能自动扩行，必须恢复原始网格尺寸后核查顺序与间距。


### Figma 素材和原位补全验收（2026-10-15）

独立封面上传后必须读取图片尺寸并检查截图；接口返回成功仍可能没有可渲染资源。本轮 WebP 元数据读取失败时改用 PNG，确认可渲染后才删除临时素材图层。上传工具不接受实例子节点 ID 时，先上传到临时普通节点，再复制图片填充到实例并清理临时节点。

捕获的容器可能使用绝对定位。复用分类区域时必须先检查父层 layoutMode，并使用原站实测位置；不能假设插入子节点会自动往下排列。人数和 playing 的网格列要随内容宽度伸缩，保留正确间距。


## Figma 共享模块与设计师编辑入口

### 游客认证弹窗（2026-10-15 原站观察）

认证设计集中在 Menus & Modals 的 `202:955`，主组件在 Components：Login `201:589`、Password recovery `201:590`、Registration `201:591`。三个变体集目前共 9 个状态；弹窗内部复用方法切换栏、电话／邮箱／密码输入框和快捷登录矢量组件，输入框通过 Label、Hint、Country code、Number placeholder 属性编辑。

桌面弹窗宽 390px，登录高 506px、恢复高 405px、注册默认／优惠码展开高 604／628px，白色背景、24px 外圆角；350px 内容宽，输入与主按钮高 44px、圆角 12px，方法切换外圆角 14px。手机参考必须重新载入原站后测量：390×844 窗口中的弹层从 y=24 延伸至底部，高 820px，不能直接缩放桌面弹窗。禁用提交按钮按原站 50% 透明度处理；恢复弹窗支持区只有顶部描边。

2026-10-15 原站只显示 Google／Telegram 两个快捷入口，旧本地参考包含五个，不能直接把旧数量当现状。此轮只查看游客界面，没有输入凭证、创建账户或提交恢复请求。原生文字／矢量检查与几何测量通过不代表全站最终像素验收；手机邮箱和优惠码、验证错误／加载／键盘、国家／币种选择及原型连线仍在待办。节点与证据索引：`qa/figma-editable-2026-10-14/auth-state-index.json`。

Figma 文件：OmnjmGzEsH8UcsGk8uJJkk。页面分为 Overview、Design System、Components、Desktop 1440、Mobile 390、Menus & Modals。改公共样式到 Components 主组件中修改，实例不脱离；内容／状态差异使用组件属性或已观察的变体。

| 模块 | 主组件节点 | 编辑方式 |
| --- | --- | --- |
| 桌面 Casino Header | `64:64` | 游客导航共享 |
| 桌面 Casino 侧栏 | `64:462`／`64:800`／`64:1137` | Lobby／分类／Quick 保留对应选中态 |
| 桌面／手机 Footer | `28:640`／`38:486` | 公共页尾及版权 |
| 手机 Header／底部导航 | `38:280`／`38:543` | 390px 实例按实际宽度核查 |
| 桌面网格卡片 | `83:6732` | Players 文字、Show players 开关；封面独立图片填充 |
| 桌面 Live／手机网格卡片 | `83:6749`／`99:15` | 不混用 Live 标记及尺寸结构 |
| 手机 Live 轮播卡片 | `131:17` | 保留 Live 标签结构 |
| 分类公共头部变体集 | `174:462` | Active=Slots；Desktop `143:615`、Mobile `174:461`，保留公共布局 |
| 手机每周游戏 | `135:4` | 原生标题、供应商、按钮；背景和封面分离 |
| 最近获奖卡片 | `136:20` 变体集 | Default／Highlighted；Amount、Game、Player 可编辑 |
| Last wins 桌面／手机 | `138:3`／`138:53` | 原生标题、计数器及复用卡片；裁切轮播溢出 |
| 游戏列表进度与加载更多 | `161:17122` | Progress text／Button label 属性，104px 高；复用原站蓝色按钮 |
| 收起侧栏／供应商面板 | `113:2`／`127:11087` | 状态组件；不复制基础页面 |

最近获奖卡片为 220×99；桌面标题区 32＋16px 间距、模块高 147，手机标题区 38＋12px 间距、模块高 149。保留文案截断、遮罩和公开匿名玩家名；计数器／获奖列表属于动态快照，不能冒充实时同步。

桌面 Slots 参考为 8 列×9 行共 72 张，包含 6 张无人数行的卡片；不能只找带 playing 的节点，否则会漏卡。图片只保留原封面，不把卡片文字、导航或整页合并成截图。组件若带原 minHeight，改为内容适应前检查并按原参考解除继承最小高度，避免多出空白。

验收组件实例必须逐层检查实例内部图层，不能只统计页面直接 findAll 的结果；某些接口不向实例内部递归，返回图片 0 不等于没有图片或图片已验证。完整性、原生可编辑性、迁移保真和最终原站一致性分别记录。

素材映射以原始地址／文件为键；同名 Mines、Plinko 等可能属于不同游戏或供应商，不能只按标题合并。复制实例后仍需逐项核查图片填充；克隆可能保留文字却丢失封面。空的 transform／图片 wrapper 若内部已有真实图片，不算缺图，末端图片图层为空才需要修复。

手机分类页的无限追加／自动加载使用一份基础页面和可重复的网格表达，不为每批游戏复制整页。390×844 固定底部导航在长页面参考中位于 y=784；保留独立图层，后续原型设置固定滚动位置。源浏览器可测得 390.4px 的内部容器，根 Frame 仍为 390px 并按真实参考裁切，不为了凑整数任意改动所有内部宽度。


## Forum 独立社区设计（2026-10-16）

Forum 原站依据为 https://forum.one-vv3591.com/。它使用独立 Header、Footer 和灰色卡片。桌面 1440px 容器宽 1370px，左列 1016px、右侧区域 324px（含 15px 左间距），独立 Owner blog 图片 300×300px。手机 Frame 宽 390px，推广右栏隐藏，Latest topics 在分类下方；页尾 Menu/Other 收起、About 展开。

使用原 Inter；背景 #2E3035、卡片约 #3A3D43、主文字 #F0F2F5、次文字 #9AA1B1，弱化控件背景 rgba(163,171,187,0.12)。Figma 颜色变量必须保留 alpha，避免半透明背景变成浅灰实色。字母头像保留原色圆底和可编辑字母。

Components 页复用 Forum / Header、Forum / Footer、Forum / Latest topic 的 Device 变体，以及 Forum / Avatar initial。主题条目通过 Title/Metadata/Replies 属性编辑；图片素材独立可替换，颜色、间距和圆角绑定 1win Forum 变量。首页只保留 Desktop 1440、Mobile 390 两份可编辑画板，避免重复同布局整页。完成范围及节点 ID 见 Progress Workflow.md。

## 主站首页登录后状态（2026-10-16）

Figma 首页主体由 Home / Shared content / Desktop、Mobile 主组件维护；游客与 After login 状态均使用实例，避免重复修改Banner、游戏行和锦标赛布局。登录后顶栏复用 Header / Signed in 的 Device 变体；桌面资料栏复用 Sidebar / Desktop signed in。Footer与手机底栏沿用原有组件。

登录后账户字段使用可编辑匿名示例：Demo user、ID 00000000、MYR、0.00；不用真实账户或财务信息作为设计内容。币种12px/16px半粗、余额14px/20px半粗；Desktop顶栏高68px，Deposit/通知按钮高44px；Mobile顶栏高60px，按钮高32px，余额区高40px。通知标记为8px橙色#FF5D26，外层不能裁切圆点。现有颜色、间距、圆角与文字样式统一复用，具体节点和完成范围见Progress Workflow.md。