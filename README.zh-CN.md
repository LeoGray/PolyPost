# PolyPost

[English](README.md) | 简体中文

PolyPost 是一个基于 Chrome MV3 的浏览器扩展，帮助你快速生成、润色、翻译并通过 web intent 发送到 Twitter/X。

## 功能

- 生成 / 润色 / 翻译社媒内容（多语言）
- 侧边栏主应用（Dashboard / Editor / Settings）
- 轻量弹窗入口（Popup）
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

生产构建（含类型检查）：

```bash
npm run build
```

预览生产构建：

```bash
npm run preview
```

## 如何在 Chrome 中加载

1. 运行 `npm run build` 生成 `dist/`
2. 打开 `chrome://extensions`
3. 开启 “开发者模式”
4. 点击 “加载已解压的扩展程序” 并选择 `dist/`

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
