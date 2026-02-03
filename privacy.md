# Privacy Policy for PolyPost

**Last Updated:** February 3, 2026

## Overview

PolyPost ("we", "our", or "us") is a Chrome extension that helps you create and manage social media posts in a side panel, with optional AI-powered polishing and translation. We do not operate any backend server or multi-user system. Most functionality runs entirely in your browser, except for optional requests you initiate to third-party services (such as AI providers or Twitter/X web intents).

## Data We Store Locally

PolyPost stores your data on your device using Chrome storage:

- **Content data**: posts, drafts, variants, and folder structures are saved in `chrome.storage.local`.
- **Settings**: preferences such as default language, UI language, theme, prompts, provider selection, custom API URL, and API keys are saved in `chrome.storage.sync` (if Chrome sync is enabled) or locally.

We do not receive or store this data on our servers.

## Data We Transmit

PolyPost only transmits data when you explicitly use certain features:

1. **AI Features (OpenAI or compatible providers)**
    - When you click polish or translate, the selected content and relevant options are sent to the API endpoint you configure (OpenAI by default, or a compatible third-party provider).
    - Your API key is stored locally in Chrome storage and is used only to authenticate requests directly to that provider.
    - We do not receive or store your content or API key.
    - Data is processed under the chosen provider's own data usage policy.

2. **Twitter/X Publishing (Web Intent)**
    - When you choose to publish, the extension opens Twitter/X Web Intent in a new tab and passes the text as URL parameters.
    - The extension does not access or store your Twitter/X credentials and does not auto-post on your behalf.

## On-page Data Access (X follower filters)

- When you use the follower filter tool, the extension reads the visible follower/following list on the current X/Twitter page to hide entries that do not match your selected filters.
- This on-page data is processed locally in your browser, is not stored by the extension, and is not transmitted to any server.

## Permissions Usage

PolyPost requests the minimum permissions required to function:

- **`storage`**: Save your drafts, folders, variants, prompts, and settings locally.
- **`sidePanel`**: Display the main interface in the browser side panel.
- **`tabs`**: Read the active tab URL and open X pages when you use follower filter shortcuts.
- **`scripting`**: Inject the follower filter panel into the current X/Twitter page when you click the inject button.
- **Optional host permissions (`http://*/*`, `https://*/*`)**:
    - Used only to allow connections to the AI API domain you configure (OpenAI by default, or a custom provider).
    - Chrome will prompt you before granting access to a new domain.

## No Central Server or Analytics

- We do not operate any server to collect, store, or analyze user data.
- We do not use analytics or tracking scripts.
- Your data remains accessible only to the current browser user.

## Remote Code Policy

PolyPost complies with Chrome Web Store policies on remote code. We do not execute remote code.

- All application logic is bundled within the extension package.
- We do not load remote scripts or use `eval()`.

## Changes to This Policy

We may update this Privacy Policy from time to time. If changes are made, we will update the "Last Updated" date and publish the new policy text.

## Contact

If you have questions about this Privacy Policy, please contact us at: [Your Contact Email]
