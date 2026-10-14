# 1win 多页 HTML 项目

唯一设计参考：[one-vv3591.com](https://one-vv3591.com/)。所有文件位于同一个 1win-html-project 目录，本地运行。

入口 index.html。双击 start-preview.cmd 启动本机预览，访问 http://127.0.0.1:4173/；关闭预览窗口即可停止服务。没有安装或打包步骤。直接双击 HTML 的 file:// 最终视觉尚未验收；字体及 mask 图标已做内嵌兼容修复。

共 31 个独立 HTML，共享 assets / css / js。缩放浏览器即可在同一网页查看手机、平板和桌面布局。默认未登录；页脚“登录后预览”或 Alt+P 可切换匿名示例账户，导航保持预览状态。账户区可打开 Profile / Settings；示例不连接真实账户。

已加弹窗、手机菜单、按钮按压、页脚与提示动画。系统开启减少动态效果时，位移改为 125ms 淡入，键盘动作即时。维护位置：js/motion.js、css/motion.css、js/common.js。页面自动轮播在减少动态效果、hover、focus、隐藏或弹窗时暂停。

31 个入口检查了桌面和手机、guest 和 auth；搜索三页另检查五尺寸。已修复顶部、侧栏蒙版图标、供应商图标、最新体育图标等。Betwave auth 仍缺 5 张动态图片；次级筛选、详情与完整游戏目录尚未实现，完整动画真实运动过程和全页面逐像素审查仍待补，不能声称 100% 复刻完成。

HTML 与响应式状态里的素材及导航均使用本地文件；原站社交／广告／合作链接不跳转。页面不请求账户、付款、投注或远程统计接口。

完整过程、最新 QA、明确未完成项目和下次维护步骤见 PROJECT-WORKFLOW.md 的最后一节；页面清单见 PAGES.md。qa/final-page-audit.json 保留修复前记录及复查，按最新文件／预览／宽度组合评估。历史 QA 与旧 ZIP 不代表最新版本。

2026-10-14：首页轮播尺寸已修复，五指定尺寸游客／登录预览以及连续缩放均检查；Betwave FAQ 已接通，但登录预览的平板／手机版布局仍待修复。最新进度以 PROJECT-WORKFLOW.md 末尾为准，证据见 qa/resume-2026-10-14/。实际项目位于 C:\Users\vince\OneDrive\Desktop\website\1win。
