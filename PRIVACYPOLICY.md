# Privacy Policy for PowerApps AI Commenter

**Effective Date:** July 9, 2025

## 1. Introduction  
PowerApps AI Commenter is a browser extension that uses OpenAI’s API to generate comments for PowerApps formulas.  
We respect your privacy and aim to be fully transparent about what the extension does and how it handles data.

---

## 2. Data Collection and Storage  

We do **not collect**, store, or transmit any personal information. The extension runs entirely in your browser.

Specifically:
- Your **OpenAI API key**, **endpoint**, and **model settings** are saved in your browser’s local storage.
- **No personal data** is collected, shared, or sent to any external server controlled by us.
- The extension does **not use tracking**, telemetry, cookies, or analytics tools.

---

## 3. Permissions Used  

The extension requests the following [Chrome Extension permissions](https://developer.chrome.com/docs/extensions/mv3/declare_permissions/):
- `clipboardWrite`: Allows copying the AI-generated comments to your clipboard.
- `storage`: Enables saving API configuration (key, endpoint, model) in your browser.

### Host Permissions  
These are required to allow the extension to work on relevant pages and call the OpenAI API:
- `https://*.powerapps.com/*`
- `https://api.openai.com/*`
- `https://*.openai.azure.com/*`

The extension **does not** access any other domains or APIs beyond these.

---

## 4. API Usage  

Your PowerApps code is sent **directly from your browser** to:
- [OpenAI API](https://api.openai.com) – if using OpenAI directly, or
- [Azure OpenAI API](https://*.openai.azure.com) – if using Microsoft Azure.

We do **not operate a backend** or proxy server.  
We do **not see, collect, or log** the code you send to these APIs.

Refer to the following privacy policies to understand how these services handle your data:
- [OpenAI Privacy Policy](https://openai.com/policies/privacy-policy)
- [Microsoft Privacy Statement](https://privacy.microsoft.com)

---

## 5. No Background Scripts or Tracking  

- The extension does **not run background scripts**.
- All UI interaction and API calls happen **only when you use the extension**.
- It does **not run continuously**, monitor pages in the background, or track your activity.

---

## 6. User Control  

You are always in control:
- You must manually enter your OpenAI or Azure OpenAI API key.
- You can delete your saved settings at any time via browser developer tools or by removing the extension.
- No account, registration, or login is required to use the extension.

---

## 7. Changes to This Policy  

If the privacy policy changes in the future, the latest version will be published at:  
[https://github.com/alondattner/powerapps-ai-commenter](https://github.com/alondattner/powerapps-ai-commenter)

---

## 8. Contact  

For questions, issues, or concerns, please contact the developer via GitHub:  
👉 [https://github.com/alondattner/powerapps-ai-commenter](https://github.com/alondattner/powerapps-ai-commenter)

---

_Last updated: July 9, 2025_