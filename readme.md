# EPhone 项目文档

## 项目目标
EPhone 是一个模拟手机操作系统界面的网页应用（基于 `yxlforever/YYY` 二次开发）。
核心体验包括：开屏破壳动画、解锁界面、桌面/小组件、聊天、AI 角色扮演、
情侣空间、相册、画板、记忆系统、各种小组件商城等。

## 启动流程（v0.0.36+ 优化版）

为了把"开屏慢/白屏闪烁"问题降到最低，启动链路经过以下优化：

### 1. CSS 全部前置到 `index.html` 的 `<head>`
所有 `<link rel="stylesheet">` 都在解析 `index.html` 时立刻被浏览器并行下载，
不再等 JS 跑到 `document.write` 才注入样式。这样消除了「白屏 → 突然有样式」的闪烁。

### 2. `document-loader.js` 改为并行加载 fragment
原版是串行加载 22 个 HTML 片段（一个加载完才加载下一个）；
新版一次性创建所有 `<script>` 标签，让浏览器并发请求。
总耗时从「所有片段耗时之和」降到「最慢那个片段的耗时」。

### 3. Service Worker 只缓存关键片段
首次安装只缓存 4 个与开屏相关的片段（`document-head`、`intro-and-home`、`cphone` + 3 个 bootstrap），
其余 18 个片段在用户真正用到对应功能时由 `fetch` 事件按需缓存。
这避免了"首次访问要等全部 22 个文件下载完才能完成 PWA 安装"导致的卡顿。

### 4. `document.write` 仍然保留
这是必要的：`document-head.html` 里包含大量 `<script defer>` 内联脚本，
只有 `document.write` 在初始解析阶段执行时，浏览器才会按"初始解析模式"
解析这些脚本，从而保留 `defer` 语义（保证 DOMContentLoaded 正确触发）。

## 关键文件说明

| 文件 | 作用 |
| --- | --- |
| `index.html` | 启动入口，已包含全部 CSS link 和启动脚本 |
| `sw.js` | Service Worker，关键片段缓存策略 |
| `modules/bootstrap/register-service-worker.js` | 注册 Service Worker |
| `modules/bootstrap/html-fragment-manifest.js` | 列出全部 fragment 脚本路径 |
| `modules/bootstrap/document-loader.js` | 并行加载 fragment，最后用 `document.write` 拼装文档 |
| `src/html/*.html` | 22 个 HTML 片段源文件，可独立编辑 |
| `generated/html-fragments/*.js` | 由 `build-index.js` 自动生成的 fragment JS（不要手动改） |
| `scripts/build-index.js` | 把 `src/html/*.html` 重新打包到 `index.html` + `generated/` |
| `html-fragments.json` | fragment 顺序清单（构建产物） |
| `asset-manifest.json` | 所有静态资源清单（构建产物） |

## 日常开发流程

### 编辑 HTML 片段
直接改 `src/html/<fragment-name>.html`，然后运行：

```bash
node scripts/build-index.js
```

它会重新生成 `index.html`（含全部 CSS link）、`generated/html-fragments/*.js`、
`html-fragments.json`、`asset-manifest.json`。

### 校验构建产物是否同步
CI 或 pre-commit 阶段可以用：

```bash
node scripts/build-index.js --check
```

如果有任何源文件改了但产物没更新，命令会非 0 退出。

### 新增/删除 CSS 文件
1. 把文件放进 `css/` 目录；
2. 在 `src/html/document-head.html` 的 `<head>` 区域加入对应 `<link>`；
3. 同时在 `scripts/build-index.js` 的 `PRELOAD_CSS_LINKS` 数组里加入同一项；
4. 运行 `node scripts/build-index.js`。

> 步骤 2 和 3 必须保持一致 —— 步骤 2 用于 `document.write` 重建文档，
> 步骤 3 用于浏览器解析 `index.html` 时提前下载。两份清单是冗余设计，
> 但能确保"首屏 CSS 不等 JS"和"`document.write` 后样式仍然生效"同时成立。

## 启动期性能调优记录

| 问题 | 原因 | 修复 |
| --- | --- | --- |
| 开屏看到"奇怪的页面" | 22 个 HTML 片段串行加载，期间 `<body>` 空白且没样式 | CSS 前置到 `index.html`，并把 fragment 改为并行加载 |
| 启动很慢 | 串行加载 22 个 fragment；SW 安装时要预缓存全部 | 改为并行；SW 只缓存关键片段，其余按需缓存 |
| 二次访问仍然不流畅 | `document.write` 重建文档时 CSS 还要重新解析 | 由于 CSS 已先下载过一次，第二次为缓存命中，几乎免费 |

