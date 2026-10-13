# 1win 本地还原项目准备包

参考网站：https://one-vv3591.com/
目标文件夹：`C:\Users\Vincent\OneDrive\Desktop\1win`

这是项目规范、采集工具和进度记录，**还不是已完成的网页 Clone**。当前 Work 浏览器无法查看原站，也无法写入你的 Windows 文件夹。为避免猜测，没有生成假的原站界面。

## 放进你的文件夹
解压 ZIP 后，将其中 `1win` 目录的内容放入目标文件夹。最终应该直接看到 `1win\AGENTS.md`，避免变成 `1win\1win\AGENTS.md`。如文件夹已有同名文件，先比较并保留现有工作，不要直接覆盖。

## 在本地 Codex 中继续
在可以访问你电脑文件的 Codex 环境打开该文件夹，然后粘贴 `LOCAL-CODEX-PROMPT.md` 的内容。AGENTS.md 包含完整还原约束。先建立原站基准，再写 UI。

## 可选：采集未登录首页
需要 Node.js 和 npm。Windows PowerShell 中执行：

```powershell
Set-Location 'C:\Users\Vincent\OneDrive\Desktop\1win'
npm install --save-dev --save-exact playwright
npx playwright install chromium
npm run capture
```

首次安装会生成 package-lock.json，保留它用于复现依赖。采集工具以全新的未登录浏览器打开首页，记录五种宽度的首屏/全页截图、可见元素测量和公开资产地址；不会登录、填写表单、下注、支付或自动点击网站。它不会下载或授权原站素材，也不会自动实现网页。

如果遇到访问错误、验证码、地区限制或登录墙，工具会记录并停止。没有检测到这些文字也不代表基准有效；仍须人工确认截图。采集目录为 `reference/<时间>/`。不要上传包含个人或支付信息的截图。

工具依据 Playwright 官方 Library 和 Screenshots 文档编写：
- https://playwright.dev/docs/library
- https://playwright.dev/docs/screenshots

## 文件说明
| 文件/目录 | 用途 |
| --- | --- |
| AGENTS.md | 原站检查、严格还原与验收规范 |
| LOCAL-CODEX-PROMPT.md | 本地继续工作的启动指令 |
| PROGRESS.md | 已完成事项、访问阻碍与下一步 |
| qa/page-inventory.csv | 逐页状态和差异记录 |
| qa/state-checklist.csv | 状态与五种分辨率的验证表 |
| qa/audit.json | 当前真实审计状态 |
| scripts/capture-reference.mjs | 本地未登录首页采集工具 |
| reference/ | 原站参考证据 |
| src/ | 后续 HTML/CSS/JS 实现 |
| assets/ | 后续可使用的原始素材 |

**当前验证：仅项目文件结构、JSON 和 JavaScript 语法。没有进行原站截图采集或网页还原验收。**
