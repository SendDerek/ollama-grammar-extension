// Settings page functionality

const enabledToggle = document.getElementById('enabled');
const ollamaUrlInput = document.getElementById('ollamaUrl');
const saveBtn = document.getElementById('saveBtn');
const testBtn = document.getElementById('testBtn');
const statusMessage = document.getElementById('statusMessage');
const connectionStatus = document.getElementById('connectionStatus');

// Load saved settings
chrome.storage.sync.get(['enabled', 'ollamaUrl'], (result) => {
  enabledToggle.checked = result.enabled !== false;
  ollamaUrlInput.value = result.ollamaUrl || 'http://localhost:11434';
});

// Test connection
testBtn.addEventListener('click', async () => {
  const url = ollamaUrlInput.value.trim() || 'http://localhost:11434';
  
  testBtn.disabled = true;
  testBtn.textContent = 'Testing...';
  connectionStatus.className = 'status';
  
  try {
    const response = await fetch(`${url}/api/tags`, {
      method: 'GET',
    });
    
    if (response.ok) {
      const data = await response.json();
      const models = data.models || [];
      const hasQwen = models.some(m => m.name.includes('qwen2.5'));

      if (hasQwen) {
        connectionStatus.textContent = '✓ Connected! Qwen 2.5 model found.';
        connectionStatus.className = 'status success';
      } else {
        connectionStatus.textContent = '⚠ Connected, but Qwen 2.5 not found. Run: ollama pull qwen2.5:3b';
        connectionStatus.className = 'status error';
      }
    } else {
      throw new Error('Server not healthy');
    }
  } catch (error) {
    connectionStatus.textContent = '✗ Cannot connect. Make sure Ollama is running: ollama serve';
    connectionStatus.className = 'status error';
  }
  
  testBtn.disabled = false;
  testBtn.textContent = 'Test Connection';
  
  setTimeout(() => {
    connectionStatus.className = 'status';
  }, 5000);
});

// Save settings
saveBtn.addEventListener('click', () => {
  const enabled = enabledToggle.checked;
  const ollamaUrl = ollamaUrlInput.value.trim() || 'http://localhost:11434';
  
  // Validate URL
  try {
    new URL(ollamaUrl);
  } catch (e) {
    showStatus('Invalid URL format', 'error');
    return;
  }
  
  // Save to storage
  chrome.storage.sync.set({
    enabled: enabled,
    ollamaUrl: ollamaUrl
  }, () => {
    showStatus('Settings saved! ✓', 'success');
    
    setTimeout(() => {
      hideStatus();
    }, 2000);
  });
});

// Enter key to save
ollamaUrlInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    saveBtn.click();
  }
});

function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = `status ${type}`;
}

function hideStatus() {
  statusMessage.className = 'status';
}
