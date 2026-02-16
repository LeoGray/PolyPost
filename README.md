# PolyPost

English | [简体中文](README.zh-CN.md)

PolyPost is a WebExtension (Manifest V3) that helps you draft, polish, translate, and send posts to Twitter/X via web intent.
One codebase builds extensions for Chrome, Firefox, and Safari.

## Features

- Generate, polish, and translate social content (multi-language)
- Main app UI (Dashboard / Editor / Settings)
- Browser-native entry behavior:
  - Chrome: popup entry + side panel support
  - Firefox: toolbar click opens native sidebar (`sidebar_action`)
  - Safari: toolbar click toggles an in-page floating panel on X/Twitter
- Safari floating panel supports drag-to-resize width and falls back to a popup window if embedding is unavailable
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

Targeted development:

```bash
npm run dev:chrome
npm run dev:firefox
npm run dev:safari
```

Production build (includes type-check):

```bash
npm run build
```

Targeted production build:

```bash
npm run build:chrome   # dist/chrome
npm run build:firefox  # dist/firefox
npm run build:safari   # dist/safari (WebExtension folder for Safari converter)
```

Preview production build:

```bash
npm run preview
```

## Load in Chrome

1. Run `npm run build:chrome` to generate `dist/chrome`
2. Open `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked" and select `dist/chrome`

## Load in Firefox (temporary add-on)

1. Run `npm run build:firefox` to generate `dist/firefox`
2. Open `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on…"
4. Select `dist/firefox/manifest.json`
5. Click the extension toolbar icon: PolyPost opens in Firefox native sidebar (no new tab)

Note: `browser_specific_settings.gecko.id` defaults to `polypost@local` for local builds.
For release builds, set your own ID with `POLYPOST_FIREFOX_ID`:

```bash
POLYPOST_FIREFOX_ID=your-addon-id@example.com npm run build:firefox
```

## Build for Safari

Safari needs an Xcode project generated via Apple's converter.

1. Run `npm run build:safari` to generate `dist/safari`
2. Convert to an Xcode project:

```bash
xcrun safari-web-extension-converter dist/safari
```

3. Open the generated project in Xcode and run the app target once (`⌘R`)
4. In Safari:
   - Enable developer menu (`Settings > Advanced`)
   - Enable `Develop > Allow Unsigned Extensions`
   - Enable the extension in `Settings > Extensions`
5. Open `x.com` or `twitter.com` and click the toolbar icon:
   - First click: show floating panel
   - Second click: hide floating panel
   - Drag the panel's left edge to resize width

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
