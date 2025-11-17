// Content script that monitors text fields and provides suggestions

let activeElement = null;
let suggestionBox = null;
let debounceTimer = null;
let lastAnalyzedText = '';
let isEnabled = true;

// Initialize
chrome.storage.sync.get(['enabled'], (result) => {
  isEnabled = result.enabled !== false;
});

// Listen for text input across the page
document.addEventListener('input', handleInput, true);
document.addEventListener('focus', handleFocus, true);
document.addEventListener('blur', handleBlur, true);

// Keyboard shortcut to trigger analysis (Ctrl/Cmd + Shift + G)
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'G') {
    e.preventDefault();
    if (activeElement) {
      analyzeText(getTextFromElement(activeElement), activeElement);
    }
  }
});

function handleFocus(e) {
  if (isTextInput(e.target)) {
    activeElement = e.target;
  }
}

function handleBlur(e) {
  if (e.target === activeElement) {
    setTimeout(() => {
      // Don't close if clicking inside the suggestion box
      if (suggestionBox && suggestionBox.contains(document.activeElement)) {
        return;
      }
      if (document.activeElement !== activeElement) {
        activeElement = null;
        removeSuggestionBox();
      }
    }, 200);
  }
}

function handleInput(e) {
  if (!isEnabled || !isTextInput(e.target)) {
    return;
  }

  activeElement = e.target;
  const text = getTextFromElement(e.target);

  clearTimeout(debounceTimer);

  if (text.length < 10 || text === lastAnalyzedText) {
    return;
  }

  // Debounce: wait for user to stop typing
  debounceTimer = setTimeout(() => {
    analyzeText(text, e.target);
  }, 500);
}

function isTextInput(element) {
  const tagName = element.tagName.toLowerCase();
  const isInput = tagName === 'textarea' ||
                  (tagName === 'input' && ['text', 'email', 'search', 'url'].includes(element.type));
  const isContentEditable = element.isContentEditable;

  return isInput || isContentEditable;
}

function getTextFromElement(element) {
  if (element.tagName.toLowerCase() === 'textarea' || element.tagName.toLowerCase() === 'input') {
    return element.value;
  }
  return element.textContent || element.innerText;
}

function setTextInElement(element, text) {
  if (element.tagName.toLowerCase() === 'textarea' || element.tagName.toLowerCase() === 'input') {
    element.value = text;
    element.dispatchEvent(new Event('input', { bubbles: true }));
  } else {
    element.textContent = text;
    element.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

async function analyzeText(text, element) {
  if (!text || text.length < 10) return;

  // Check if extension context is valid
  if (!chrome.runtime || !chrome.runtime.id) {
    showError(element, 'Extension was reloaded. Please refresh this page (F5) to reconnect.');
    return;
  }

  lastAnalyzedText = text;
  showLoadingIndicator(element);

  try {
    const response = await chrome.runtime.sendMessage({
      type: 'ANALYZE_TEXT',
      text: text
    });

    if (response.error) {
      showError(element, response.error);
      return;
    }

    if (response.corrected && response.corrected !== text) {
      showCorrection(response, element);
    } else {
      showNoSuggestions(element);
    }
  } catch (error) {
    console.error('[Ollama] Error:', error.message);
    showError(element, 'Failed to analyze text. Make sure Ollama is running with CORS support.');
  }
}

function showLoadingIndicator(element) {
  removeSuggestionBox();
  
  const box = createSuggestionBox(element);
  box.innerHTML = `
    <div class="cga-loading">
      <div class="cga-spinner"></div>
      <span>Analyzing with Ollama...</span>
    </div>
  `;
  
  document.body.appendChild(box);
  suggestionBox = box;
}

function showCorrection(response, element) {
  removeSuggestionBox();

  const box = createSuggestionBox(element);

  const header = document.createElement('div');
  header.className = 'cga-header';
  header.innerHTML = `
    <span class="cga-title">✨ Grammar & Style Corrections</span>
    <button class="cga-close">✕</button>
  `;
  box.appendChild(header);

  const content = document.createElement('div');
  content.className = 'cga-correction-content';

  // Show before/after comparison (FIRST)
  const comparison = document.createElement('div');
  comparison.className = 'cga-comparison';
  comparison.innerHTML = `
    <div class="cga-comparison-section">
      <div class="cga-comparison-label">Original:</div>
      <div class="cga-original-text">${escapeHtml(response.original)}</div>
    </div>
    <div class="cga-comparison-arrow">↓</div>
    <div class="cga-comparison-section">
      <div class="cga-comparison-label">Corrected:</div>
      <div class="cga-corrected-text">${escapeHtml(response.corrected)}</div>
    </div>
  `;
  content.appendChild(comparison);

  // Action buttons (SECOND)
  const actions = document.createElement('div');
  actions.className = 'cga-actions';
  actions.innerHTML = `
    <button class="cga-apply-all-btn">Apply Correction</button>
    <button class="cga-dismiss-btn">Dismiss</button>
  `;
  content.appendChild(actions);

  // Show tone feedback (LAST) - only if there was a tone improvement
  if (response.toneFeedback && response.toneFeedback.trim() !== '') {
    const feedbackBox = document.createElement('div');
    feedbackBox.className = 'cga-tone-feedback';
    feedbackBox.innerHTML = `
      <div class="cga-tone-header">
        <span class="cga-tone-icon">💼</span>
        Tone Improvement:
      </div>
      <div class="cga-tone-text">
        ${escapeHtml(response.toneFeedback)}
      </div>
    `;
    content.appendChild(feedbackBox);
  }

  box.appendChild(content);

  // Event listeners
  box.querySelector('.cga-close').addEventListener('click', removeSuggestionBox);
  box.querySelector('.cga-apply-all-btn').addEventListener('click', () => {
    applyCorrection(response.corrected, element);
  });
  box.querySelector('.cga-dismiss-btn').addEventListener('click', removeSuggestionBox);

  document.body.appendChild(box);
  suggestionBox = box;
}

function escapeHtml(text) {
  // Handle non-string inputs
  if (typeof text !== 'string') {
    if (typeof text === 'object' && text !== null) {
      // Try to extract text property if it exists
      if (text.text) return escapeHtml(text.text);
      if (text.message) return escapeHtml(text.message);
      // Otherwise stringify it
      text = JSON.stringify(text);
    } else {
      text = String(text);
    }
  }
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showNoSuggestions(element) {
  removeSuggestionBox();
  
  const box = createSuggestionBox(element);
  box.innerHTML = `
    <div class="cga-no-suggestions">
      <span class="cga-checkmark">✓</span>
      <span>Looking good! No suggestions.</span>
    </div>
  `;
  
  document.body.appendChild(box);
  suggestionBox = box;
  
  setTimeout(removeSuggestionBox, 2000);
}

function showError(element, message) {
  removeSuggestionBox();
  
  const box = createSuggestionBox(element);
  box.innerHTML = `
    <div class="cga-error">
      <span class="cga-error-icon">⚠️</span>
      <div style="flex: 1;">
        <div style="font-weight: 600; margin-bottom: 4px;">Analysis Failed</div>
        <div style="font-size: 12px;">${message}</div>
        <button class="cga-retry-btn" style="margin-top: 8px; padding: 4px 12px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
          Try Again (Ctrl+Shift+G)
        </button>
      </div>
      <button class="cga-close">✕</button>
    </div>
  `;
  
  const closeBtn = box.querySelector('.cga-close');
  closeBtn.addEventListener('click', removeSuggestionBox);
  
  const retryBtn = box.querySelector('.cga-retry-btn');
  retryBtn.addEventListener('click', () => {
    removeSuggestionBox();
    if (activeElement) {
      analyzeText(getTextFromElement(activeElement), activeElement);
    }
  });
  
  document.body.appendChild(box);
  suggestionBox = box;
}

function createSuggestionBox(element) {
  const box = document.createElement('div');
  box.className = 'cga-suggestion-box';

  const rect = element.getBoundingClientRect();
  const top = rect.bottom + window.scrollY + 5;
  const left = rect.left + window.scrollX;
  const maxWidth = Math.max(400, rect.width);

  box.style.position = 'fixed';
  box.style.top = `${top}px`;
  box.style.left = `${left}px`;
  box.style.maxWidth = `${maxWidth}px`;

  return box;
}

function removeSuggestionBox() {
  if (suggestionBox) {
    suggestionBox.remove();
    suggestionBox = null;
  }
}

function applyCorrection(correctedText, element) {
  // Update lastAnalyzedText BEFORE setting the text to prevent re-analysis
  lastAnalyzedText = correctedText;

  // Clear any pending debounce timer to prevent duplicate analysis
  clearTimeout(debounceTimer);

  setTextInElement(element, correctedText);
  removeSuggestionBox();

  element.style.transition = 'background-color 0.3s';
  element.style.backgroundColor = '#d4edda';
  setTimeout(() => {
    element.style.backgroundColor = '';
  }, 500);
}

function dismissSuggestion(index, box) {
  const items = box.querySelectorAll('.cga-suggestion-item');
  if (items[index]) {
    items[index].style.opacity = '0';
    items[index].style.height = '0';
    items[index].style.margin = '0';
    items[index].style.padding = '0';
    setTimeout(() => items[index].remove(), 300);
  }
  
  setTimeout(() => {
    if (box.querySelectorAll('.cga-suggestion-item').length === 0) {
      removeSuggestionBox();
    }
  }, 350);
}

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.enabled) {
    isEnabled = changes.enabled.newValue;
  }
});
