# PolyPost

English | [简体中文](README.zh-CN.md)

PolyPost is a Chrome MV3 extension that helps you draft, polish, translate, and send posts to Twitter/X via web intent.

## Features

- Generate, polish, and translate social content (multi-language)
- Side panel app (Dashboard / Editor / Settings)
- Lightweight popup entry point
- Works with OpenAI and OpenAI-compatible providers

## Project Structure

- `src/background/`: Service Worker entry
- `src/popup/`: popup UI
- `src/sidepanel/`: main app UI
- `src/components/`: shared components
- `src/services/`: OpenAI / Storage / Prompt helpers
- `src/store/`: Zustand state slices
- `src/styles/`: Tailwind + global styles
- `public/`: static assets

## Development & Build

Install dependencies:

```bash
npm install
```

Development (Vite + CRXJS):

```bash
npm run dev
```

Production build (includes type-check):

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Load in Chrome

1. Run `npm run build` to generate `dist/`
2. Open `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked" and select `dist/`

## Configuration & Security

- API keys are entered via Settings and stored in Chrome Storage; do not hardcode secrets.
- If you add permissions, update `manifest.json` and explain the purpose.

## Contributing

PRs and suggestions are welcome. Please follow:

- Conventional Commits: `feat:`, `fix:`, `docs:`, etc.
- Provide screenshots for UI changes
- Call out manifest or permission changes

## License

MIT

## Privacy Policy

[Privacy Policy](privacy.md)
