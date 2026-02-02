# Privacy Policy for PolyPost

**Last Updated:** February 2, 2026

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

## Permissions Usage
PolyPost requests the minimum permissions required to function:

- **`storage`**: Save your drafts, folders, variants, prompts, and settings locally.
- **`sidePanel`**: Display the main interface in the browser side panel.
- **`permissions`**: Request optional host permissions at runtime when you use a new AI API domain.
- **Optional host permissions (`<all_urls>`)**: Used only to connect to the AI API domain you configure (e.g., OpenAI or a compatible provider). Chrome will prompt you when a new domain is needed. If you deny, AI features for that domain will not work.

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
