# Privacy Policy for PolyPost

**Last Updated:** February 2, 2026

## Introduction
PolyPost ("we", "our", or "us") respects your privacy. This Privacy Policy explains how PolyPost collects, uses, and protects your information when you use our Chrome Extension.

## Data Collection and storage
**We do not collect, store, or share any of your personal data on our servers.**

PolyPost operates as a standalone extension with no backend database. All data generated or used by the extension is stored locally on your device or synced via your personal Chrome account.

*   **Local Data**: Your posts, drafts, folders, and settings are stored locally in your browser using the Chrome `storage` API.
*   **Sync Data**: If valid, some preferences may be synced across your devices using Chrome's built-in sync mechanism (`storage.sync`), which is managed by Google.

## Data Usage
The data you input into PolyPost is used solely for the purpose of providing the extension's functionality:

1.  **AI Services (OpenAI)**:
    *   To provide AI-powered text polishing and translation features, the content you explicitly select is sent to OpenAI's API (`https://api.openai.com`).
    *   This data is transmitted securely and is processed according to OpenAI's API data usage policies (OpenAI does not train on API data by default).
    *   Your OpenAI API Key is stored locally on your device and is never shared with us or any other third party.

2.  **Twitter (X) Integration**:
    *   The extension interacts with Twitter/X via standard web links (Web Intents) to allow you to publish content. No Twitter credentials are accessed or stored by the extension.

## Permissions Usage
PolyPost requests the minimum permissions necessary to function:

*   **`storage`**: Required to save your drafts, folders, and application settings locally.
*   **`sidePanel`**: Required to display the application interface in the browser side panel.
*   **Host Permissions (`https://api.openai.com/*`)**: Required to communicate directly with OpenAI servers for text processing features.

## Remote Code Policy
PolyPost is fully compliant with the Chrome Web Store policy regarding remote code. **We do not execute any remote code.**
*   All application logic is bundled within the extension package.
*   We do not load external scripts or use `eval()` functions.

## Changes to This Policy
We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.

## Contact Us
If you have any questions about this Privacy Policy, please contact us at: [Your Contact Email]
