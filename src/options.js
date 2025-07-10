(() => {
// ===== Helpers =====
const $ = (id) => document.getElementById(id);

// ===== Storage: Load & Save Settings =====
const loadSettings = () => {
  chrome.storage.local.get(['openaiApiKey', 'apiEndpoint', 'modelName'], (result) => {
    if (result.openaiApiKey) {
      $('apiKey').value = result.openaiApiKey;
    }
    if (result.apiEndpoint) {
      $('apiEndpoint').value = result.apiEndpoint;
    }
    if (result.modelName) {
      $('modelName').value = result.modelName;
    }
  });
};

const saveSettings = () => {
  const apiEndpoint = $('apiEndpoint').value.trim();
  const modelName = $('modelName').value.trim();
  const apiKey = $('apiKey').value.trim();
  // Validation
  if (!apiEndpoint) {
    showStatus('Please enter your OpenAI API endpoint.', 'error');
    return false;
  }
  if (!modelName) {
    showStatus('Please enter your OpenAI deployment/model name.', 'error');
    return false;
  }
  if (!apiKey) {
    showStatus('Please enter your OpenAI API key.', 'error');
    return false;
  }
  chrome.storage.local.set({
    openaiApiKey: apiKey,
    apiEndpoint,
    modelName
  }, () => {
    if (chrome.runtime.lastError) {
      showStatus('Error saving settings: ' + chrome.runtime.lastError.message, 'error');
    } else {
      showStatus('Settings saved successfully!', 'success');
    }
  });
  return true;
};

// ===== UI: Status Message =====
const showStatus = (message, type) => {
  const statusDiv = $('status');
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  statusDiv.style.display = 'block';
  if (type === 'success') {
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 3000);
  }
};

// ===== Event Handlers =====
const onFormSubmit = (e) => {
  e.preventDefault();
  saveSettings();
};

const onSaveBtnClick = (e) => {
  e.preventDefault();
  saveSettings();
};

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  $('settingsForm').addEventListener('submit', onFormSubmit);
  $('saveBtn').addEventListener('click', onSaveBtnClick);
});

})(); 