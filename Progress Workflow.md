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

最新版本：2026-10-14，Asia/Kuala_Lumpur。先读本文件顶部决定下一步，设计和代码维护规则只查 **Design Rule.md**。旧 README / PROGRESS / PAGES / PROJECT-WORKFLOW / 遗漏细节已归档为历史，不再作为现状依据。

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
