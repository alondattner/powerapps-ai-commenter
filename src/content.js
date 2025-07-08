console.log("[Power Apps AI Commenter] Running in:", window.location.href);

(function () {
// ===== Constants =====
const STYLE_IDS = {
  popupAnim: 'ai-popup-anim-style',
  spinner: 'ai-spinner-style',
  btnDisabled: 'ai-modal-btn-disabled-style',
  textareaFocus: 'ai-modal-textarea-focus-style',
  userSelect: 'ai-modal-user-select-style',
  btnHover: 'ai-comment-btn-hover-style',
};
const BUTTON_ID = 'commentCodeButton';
const MODAL_ID = 'ai-comment-modal';
const POPUP_ID = 'ai-comment-popup';

// ===== Utility: Style Injection =====
function injectStyle(id, css) {
  if (!document.getElementById(id)) {
    const style = document.createElement('style');
    style.id = id;
    style.textContent = css;
    document.head.appendChild(style);
  }
}

// ===== Storage Utilities =====
async function getApiKey() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['openaiApiKey'], function(result) {
      resolve(result.openaiApiKey || '');
    });
  });
}

// ===== Popup Notification =====
function showPopup(message, type = 'success') {
  const existingPopup = document.getElementById(POPUP_ID);
  if (existingPopup) existingPopup.remove();

  injectStyle(STYLE_IDS.popupAnim, `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `);

  const popup = document.createElement('div');
  popup.id = POPUP_ID;
  popup.style.cssText = `
    position: fixed; top: 20px; right: 20px;
    background: ${type === 'success' ? '#52ae32' : '#B00020'};
    color: white; padding: 10px 20px; border-radius: 5px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 10002;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 15px; max-width: 300px; word-wrap: break-word;
    animation: slideIn 0.3s ease-out;
  `;
  popup.textContent = message;
  document.body.appendChild(popup);
  setTimeout(() => { if (popup.parentNode) popup.remove(); }, 5000);
}

// ===== Clipboard Utility =====
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}

// ===== OpenAI API Call =====
async function addCommentsToCode(code) {
  const { openaiApiKey, apiEndpoint, modelName } = await new Promise((resolve) => {
    chrome.storage.sync.get(['openaiApiKey', 'apiEndpoint', 'modelName'], function(result) {
      resolve({
        openaiApiKey: result.openaiApiKey || '',
        apiEndpoint: result.apiEndpoint || 'https://api.openai.com/v1/chat/completions',
        modelName: result.modelName || 'gpt-4.1-mini',
      });
    });
  });
  if (!openaiApiKey) throw new Error('OpenAI API key not configured. Please go to the extension options to add your API key.');
  const prompt = `# Instructions\nYou are a professional PowerApps developer. Add helpful and concise comments to the following code.\n- ALWAYS, IN ALL CASES, place comments on a separate line directly ABOVE the code they describe.\n- DO NOT, UNDER NO CIRCUMSTANCES, use in-line comments on the same line as the code.\n- Start each comment with a capital letter and end it with a period.\n- Use clear, formal, and professional language.\n- Avoid phrases like "This line does..." or "This sets...".\n\n# Result\n- ALWAYS, IN ALL CASES, return only the original code including the comments, with no additional explanation or formatting.\n- DO NOT, UNDER NO CIRCUMSTANCES, wrap the code block in triple backticks or any markdown formatting.\n\n# Code\n${code}`;
  const response = await fetch(apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: modelName,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 10000,
      temperature: 0.2,
    }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
  }
  const data = await response.json();
  return data.choices[0].message.content.trim();
}

// ===== Modal Popup for AI Code Commenting =====
function showAIPopup(prefillCode) {
  const existingModal = document.getElementById(MODAL_ID);
  if (existingModal) existingModal.remove();

  // Overlay
  const overlay = document.createElement('div');
  overlay.id = MODAL_ID;
  overlay.style.cssText = `position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.25); z-index: 10001; display: flex; align-items: center; justify-content: center;`;

  // Modal
  const modal = document.createElement('div');
  modal.style.cssText = `background: #fff; border-radius: 10px; box-shadow: 0 4px 24px rgba(0,0,0,0.18); padding: 20px; min-width: 800px; min-height: 400px; max-width: 98vw; max-height: 90vh; display: flex; flex-direction: column; position: relative; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;`;

  // Loading overlay
  const loadingOverlay = document.createElement('div');
  loadingOverlay.className = 'ai-modal-loading-overlay';
  loadingOverlay.style.cssText = `display: none; position: absolute; top: 0; left: 0; right: 0; bottom: 0; border-radius: 10px; background: rgba(255,255,255,0.7); z-index: 10; align-items: center; justify-content: center;`;
  // Spinner
  injectStyle(STYLE_IDS.spinner, `@keyframes ai-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`);
  const spinner = document.createElement('div');
  spinner.style.cssText = 'display: inline-block; width: 45px; height: 45px; border: 4px solid #eee; border-top: 4px solid #742774; border-radius: 50%; animation: ai-spin 1s linear infinite;';
  loadingOverlay.appendChild(spinner);
  loadingOverlay.style.display = 'none';
  loadingOverlay.hidden = true;
  modal.appendChild(loadingOverlay);

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕';
  closeBtn.style.cssText = 'position: absolute; top: 20px; right: 20px; background: none; border: none; font-size: 25px; cursor: pointer; color: #444; z-index: 11;';
  closeBtn.onclick = () => overlay.remove();
  modal.appendChild(closeBtn);

  // Header row
  const headerRow = document.createElement('div');
  headerRow.style.cssText = 'display: flex; align-items: baseline; gap: 10px; margin-bottom: 20px;';
  const title = document.createElement('h2');
  title.textContent = 'Power Apps AI Commenter';
  title.style.margin = '0';
  title.style.color = '#333';
  title.style.lineHeight = '1';
  const byline = document.createElement('div');
  byline.style.cssText = 'font-size: 13px; color: #7C7C7C; white-space: nowrap;';
  byline.innerHTML = 'created by <a href="https://github.com/alondattner" target="_blank" style="color:#742774;text-decoration:none;">Alon Dattner</a>';
  headerRow.appendChild(title);
  headerRow.appendChild(byline);
  modal.appendChild(headerRow);

  // Flex row for textareas
  const row = document.createElement('div');
  row.style.cssText = 'display: flex; gap: 20px; flex: 1 1 auto;';
  // Left (input) textarea
  const leftCol = document.createElement('div');
  leftCol.style.cssText = 'flex: 1; display: flex; flex-direction: column;';
  const leftLabel = document.createElement('label');
  leftLabel.textContent = 'Original Code';
  leftLabel.style.marginBottom = '5px';
  leftLabel.style.color = '#7C7C7C';
  const leftTextarea = document.createElement('textarea');
  leftTextarea.style.cssText = 'width: 100%; height: 300px; resize: none; font-size: 15px; padding: 10px; border-radius: 5px; border: 1px solid #7C7C7C; font-family: Menlo, Consolas, monospace, sans-serif, "Droid Sans Mono", "monospace", monospace;';
  leftTextarea.value = prefillCode || '';
  leftCol.appendChild(leftLabel);
  leftCol.appendChild(leftTextarea);
  // Right (output) textarea
  const rightCol = document.createElement('div');
  rightCol.style.cssText = 'flex: 1; display: flex; flex-direction: column;';
  const rightLabel = document.createElement('label');
  rightLabel.textContent = 'Commented Code';
  rightLabel.style.marginBottom = '5px';
  rightLabel.style.color = '#7C7C7C';
  const rightTextarea = document.createElement('textarea');
  rightTextarea.style.cssText = 'width: 100%; height: 300px; resize: none; font-size: 15px; padding: 10px; border-radius: 5px; border: 1px solid #ACA7A7; font-family: Menlo, Consolas, monospace, sans-serif, "Droid Sans Mono", "monospace", monospace; background: rgba(172,167,167,0.25);';
  rightTextarea.readOnly = true;
  rightCol.appendChild(rightLabel);
  rightCol.appendChild(rightTextarea);
  row.appendChild(leftCol);
  row.appendChild(rightCol);
  modal.appendChild(row);

  // Button row
  const btnRow = document.createElement('div');
  btnRow.style.cssText = 'display: flex; flex-direction: row; justify-content: space-between; margin-top: 20px; gap: 20px;';
  const leftBtnContainer = document.createElement('div');
  leftBtnContainer.style.cssText = 'flex: 1; display: flex; justify-content: flex-end;';
  const rightBtnContainer = document.createElement('div');
  rightBtnContainer.style.cssText = 'flex: 1; display: flex; justify-content: flex-end;';
  const commentBtn = document.createElement('button');
  commentBtn.textContent = 'Comment with AI';
  commentBtn.style.cssText = 'background: #742774; color: white; border: none; border-radius: 5px; padding: 5px 20px; font-size: 15px; cursor: pointer; min-width: 160px;';
  const copyBtn = document.createElement('button');
  copyBtn.textContent = 'Copy & Close';
  copyBtn.style.cssText = 'background: #742774; color: white; border: none; border-radius: 5px; padding: 5px 20px; font-size: 15px; cursor: pointer; min-width: 160px;';
  copyBtn.disabled = true;
  rightTextarea.addEventListener('input', () => { copyBtn.disabled = !rightTextarea.value.trim(); });
  const updateCopyBtnState = () => { copyBtn.disabled = !rightTextarea.value.trim(); };
  commentBtn.onclick = async () => {
    const code = leftTextarea.value.trim();
    if (!code) { showPopup('Please paste code to comment.', 'error'); return; }
    loadingOverlay.hidden = false;
    loadingOverlay.style.display = 'flex';
    leftTextarea.disabled = true;
    rightTextarea.disabled = true;
    commentBtn.disabled = true;
    copyBtn.disabled = true;
    try {
      const commented = await addCommentsToCode(code);
      rightTextarea.value = commented;
      updateCopyBtnState();
    } catch (err) {
      showPopup('Error: ' + err.message, 'error');
    }
    loadingOverlay.hidden = true;
    loadingOverlay.style.display = 'none';
    leftTextarea.disabled = false;
    rightTextarea.disabled = false;
    commentBtn.disabled = false;
    updateCopyBtnState();
  };
  copyBtn.onclick = async () => {
    const commented = rightTextarea.value;
    if (!commented) { showPopup('No commented code to copy.', 'error'); return; }
    const success = await copyToClipboard(commented);
    if (success) {
      showPopup('Commented code copied to clipboard!');
      overlay.remove();
    } else {
      showPopup('Failed to copy to clipboard. Please copy manually.', 'error');
    }
  };
  leftBtnContainer.appendChild(commentBtn);
  rightBtnContainer.appendChild(copyBtn);
  btnRow.appendChild(leftBtnContainer);
  btnRow.appendChild(rightBtnContainer);
  modal.appendChild(btnRow);

  // Modal styles
  injectStyle(STYLE_IDS.btnDisabled, `#${MODAL_ID} button:disabled { background: #ACA7A7 !important; color: #fff !important; cursor: not-allowed !important; opacity: 0.7; }`);
  injectStyle(STYLE_IDS.textareaFocus, `#${MODAL_ID} textarea:focus { border-color: #742774 !important; outline: none !important; }`);
  injectStyle(STYLE_IDS.userSelect, `#${MODAL_ID}, #${MODAL_ID} * { user-select: text !important; -webkit-user-select: text !important; -moz-user-select: text !important; -ms-user-select: text !important; }`);

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

// ===== Toolbar Button Creation =====
function createCustomButton() {
  const button = document.createElement('button');
  button.type = 'button';
  button.style.border = 'none';
  button.id = BUTTON_ID;
  button.title = 'Comment with AI';
  button.className = 'ms-Button ms-Button--commandBar';
  button.setAttribute('data-is-focusable', 'true');
  button.innerHTML = `
    <span class="ms-Button-flexContainer" data-automationid="splitbuttonprimary">
      <i class="ms-Icon ms-Button-icon" aria-hidden="true">💬</i>
      <span class="ms-Button-textContainer">
        <span class="ms-Button-label">Comment with AI</span>
      </span>
    </span>
  `;
  button.onclick = () => showAIPopup('');
  return button;
}

// ===== Toolbar Button Injection Interval =====
setInterval(() => {
  const toolbar = document.getElementById('formatTextClickRegion');
  if (!toolbar || toolbar.querySelector(`#${BUTTON_ID}`)) return;
  injectStyle(STYLE_IDS.btnHover, `#${BUTTON_ID}:hover { background: rgb(210, 210, 210) !important; }`);
  toolbar.appendChild(createCustomButton());
  console.log('[Power Apps AI Commenter] Toolbar found - Button added.');
}, 500);

console.log('[Power Apps AI Commenter] Running in:', window.location.href);

})();