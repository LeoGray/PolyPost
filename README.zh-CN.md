# PolyPost

[English](README.md) | 简体中文

PolyPost 是一个基于 WebExtension（Manifest V3）的浏览器扩展，帮助你快速生成、润色、翻译并通过 web intent 发送到 Twitter/X。
同一份代码可同时构建 Chrome、Firefox、Safari 三个平台的扩展。

## 功能

- 生成 / 润色 / 翻译社媒内容（多语言）
- 主应用界面（Dashboard / Editor / Settings）
- 按浏览器提供原生入口体验：
  - Chrome：Popup 入口 + side panel 支持
  - Firefox：点击扩展图标直接打开原生侧栏（`sidebar_action`）
  - Safari：点击扩展图标在 X/Twitter 页面显示/隐藏悬浮面板
- Safari 悬浮面板支持拖拽调宽；若页面嵌入受限会自动回退到独立小窗
- 支持 OpenAI 及兼容 OpenAI 的第三方服务

## 项目结构

- `src/background/`：Service Worker 入口
- `src/popup/`：弹窗 UI
- `src/sidepanel/`：主应用 UI
- `src/components/`：共享组件
- `src/services/`：OpenAI / Storage / Prompt helpers
- `src/store/`：Zustand 状态切片
- `src/styles/`：Tailwind + 全局样式
- `public/`：静态资源

## 开发与构建

先安装依赖：

```bash
npm install
```

开发模式（Vite + CRXJS）：

```bash
npm run dev
```

按浏览器目标运行开发模式：

```bash
npm run dev:chrome
npm run dev:firefox
npm run dev:safari
```

生产构建（含类型检查）：

```bash
npm run build
```

按浏览器目标构建：

```bash
npm run build:chrome   # dist/chrome
npm run build:firefox  # dist/firefox
npm run build:safari   # dist/safari（给 Safari Converter 的 WebExtension 目录）
```

预览生产构建：

```bash
npm run preview
```

## 如何在 Chrome 中加载

1. 运行 `npm run build:chrome` 生成 `dist/chrome`
2. 打开 `chrome://extensions`
3. 开启 “开发者模式”
4. 点击 “加载已解压的扩展程序” 并选择 `dist/chrome`

## 如何在 Firefox 中加载（临时扩展）

1. 运行 `npm run build:firefox` 生成 `dist/firefox`
2. 打开 `about:debugging#/runtime/this-firefox`
3. 点击 “Load Temporary Add-on…”
4. 选择 `dist/firefox/manifest.json`
5. 点击扩展图标，PolyPost 会在 Firefox 原生侧栏打开（不会新建标签页）

注意：本地构建默认使用 `browser_specific_settings.gecko.id = polypost@local`。
发布到 AMO 时，建议通过 `POLYPOST_FIREFOX_ID` 传入你自己的 ID：

```bash
POLYPOST_FIREFOX_ID=your-addon-id@example.com npm run build:firefox
```

## 如何构建 Safari 扩展

Safari 需要通过 Apple 的 Converter 生成 Xcode 项目。

1. 运行 `npm run build:safari` 生成 `dist/safari`
2. 将 WebExtension 转换成 Xcode 项目：

```bash
xcrun safari-web-extension-converter dist/safari
```

3. 用 Xcode 打开生成的项目，先运行一次 App target（`⌘R`）
4. 在 Safari 中：
   - 开启开发者菜单（`Settings > Advanced`）
   - 开启 `Develop > Allow Unsigned Extensions`
   - 在 `Settings > Extensions` 启用该扩展
5. 打开 `x.com` 或 `twitter.com`，点击扩展图标：
   - 第一次点击显示悬浮面板
   - 再点一次隐藏悬浮面板
   - 拖拽面板左边缘可调整宽度

## 配置与安全

- API Key 仅通过设置页输入并存储在 Chrome Storage 中，请勿硬编码
- 如需新增权限，请同步更新 `manifest.json` 并说明用途

## 贡献

欢迎提交 PR 和建议，请尽量遵循：

- Conventional Commits：`feat:`, `fix:`, `docs:` 等
- UI 相关改动请提供截图
- 说明影响到的权限或 manifest 变更

## 许可

MIT

## 隐私政策

[隐私政策](privacy_zh.md)
