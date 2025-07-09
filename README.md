# PowerApps AI Commenter

A browser extension that helps you add AI-generated comments to your PowerApps code using OpenAI models.

## Features
- AI-powered code commenting (default: GPT-4.1-mini)
- Simple popup UI: paste code, get comments, copy result
- Works with either the OpenAI API (direct) or Azure OpenAI API (for users who want more control over their data)
- Fast, lightweight, and easy to configure

> **Note:** You must create and provide your own OpenAI or Azure OpenAI API key. This extension does not provide an API key.

## Demo

See it in action:

![Power Apps AI Commenter Demo](./demo.gif)

## Installation
1. Download the latest zip from GitHub.
2. Unpack the zip file.
3. In your browser, go to `chrome://extensions` and enable Developer Mode.
4. Click "Load unpacked" and select the `src` folder from the unpacked files.

## How to Use
1. Right-click the extension icon > Options. Enter your OpenAI API key, endpoint, and model name. Save.
2. In PowerApps, copy your code.
3. Click the "💬 Comment with AI" button in the toolbar.
4. Paste your code into the popup, click "Comment with AI".
5. Copy the commented code back to your editor.