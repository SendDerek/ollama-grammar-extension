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
  console.log('[Content] Focus event on:', e.target.tagName, e.target.id);
  if (isTextInput(e.target)) {
    activeElement = e.target;
    console.log('[Content] Set activeElement to:', e.target.id);
  }
}

function handleBlur(e) {
  console.log('[Content] Blur event on:', e.target.tagName, e.target.id);
  if (e.target === activeElement) {
    setTimeout(() => {
      if (document.activeElement !== activeElement) {
        console.log('[Content] Clearing activeElement');
        activeElement = null;
        removeSuggestionBox();
      }
    }, 200);
  }
}

function handleInput(e) {
  console.log('[Content] Input event detected on:', e.target.tagName, e.target.type, e.target.id);
  
  if (!isEnabled || !isTextInput(e.target)) {
    console.log('[Content] Input rejected - enabled:', isEnabled, 'isTextInput:', isTextInput(e.target));
    return;
  }
  
  activeElement = e.target;
  const text = getTextFromElement(e.target);
  
  console.log('[Content] Text from element:', text.substring(0, 50) + '...');
  console.log('[Content] Text length:', text.length);
  
  clearTimeout(debounceTimer);
  
  if (text.length < 10 || text === lastAnalyzedText) {
    console.log('[Content] Skipping analysis - too short or already analyzed');
    return;
  }
  
  console.log('[Content] Setting debounce timer for 0.5 seconds...');

  // Debounce: wait for user to stop typing
  debounceTimer = setTimeout(() => {
    console.log('[Content] Debounce timer fired! Analyzing text...');
    analyzeText(text, e.target);
  }, 500);
}

function isTextInput(element) {
  const tagName = element.tagName.toLowerCase();
  const isInput = tagName === 'textarea' || 
                  (tagName === 'input' && ['text', 'email', 'search', 'url'].includes(element.type));
  const isContentEditable = element.isContentEditable;
  
  const result = isInput || isContentEditable;
  
  console.log('[Content] isTextInput check:', {
    tagName,
    type: element.type,
    id: element.id,
    isInput,
    isContentEditable,
    result
  });
  
  return result;
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

  console.log('[Content] analyzeText called with text:', text.substring(0, 50) + '...');
  console.log('[Content] Target element:', element.tagName, element.id);

  lastAnalyzedText = text;
  showLoadingIndicator(element);

  try {
    console.log('[Content] Sending message to background...');
    const response = await chrome.runtime.sendMessage({
      type: 'ANALYZE_TEXT',
      text: text
    });

    console.log('[Content] Received response from background:', response);

    if (response.error) {
      console.error('[Content] Error from background:', response.error);
      showError(element, response.error);
      return;
    }

    if (response.corrected && response.corrected !== text) {
      console.log('[Content] Showing correction (text changed)');
      showCorrection(response, element);
    } else {
      console.log('[Content] No corrections needed (text unchanged)');
      showNoSuggestions(element);
    }
  } catch (error) {
    console.error('[Content] Error analyzing text:', error);
    console.error('[Content] Error stack:', error.stack);
    showError(element, 'Failed to analyze text. Make sure Ollama is running.');
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

  console.log('[Content] showCorrection received response:', response);

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

  // Show business value translation if available
  if (response.businessValue && typeof response.businessValue === 'string') {
    const businessValueBox = document.createElement('div');
    businessValueBox.className = 'cga-business-value';
    businessValueBox.innerHTML = `
      <div class="cga-business-value-header">
        <span class="cga-business-icon">💼</span>
        Executive-Friendly Version:
      </div>
      <div class="cga-business-value-text">${escapeHtml(response.businessValue)}</div>
      <div class="cga-business-value-tip">
        💡 Tip: This version emphasizes business impact for leadership communication
      </div>
    `;
    content.appendChild(businessValueBox);
  } else if (response.businessValue) {
    console.error('[Content] businessValue is not a string:', typeof response.businessValue, response.businessValue);
  }

  // Show issues found
  if (response.issues && Array.isArray(response.issues) && response.issues.length > 0) {
    const issuesList = document.createElement('div');
    issuesList.className = 'cga-issues-list';
    issuesList.innerHTML = `
      <div class="cga-issues-header">
        <span class="cga-learning-icon">💡</span>
        Learning Points (${response.issues.length}):
      </div>
      <ul class="cga-educational-list">
        ${response.issues.map(issue => {
          // Handle both string and object formats
          if (typeof issue === 'string') {
            return `<li><span class="cga-issue-bullet">•</span> ${escapeHtml(issue)}</li>`;
          } else if (typeof issue === 'object' && issue !== null) {
            // Structured format with WHAT, WHY, RULE, HELP
            let issueHtml = '<li class="cga-structured-issue">';
            if (issue.WHAT) {
              issueHtml += `<div class="cga-issue-what"><strong>Issue:</strong> ${escapeHtml(issue.WHAT)}</div>`;
            }
            if (issue.WHY) {
              issueHtml += `<div class="cga-issue-why"><strong>Why:</strong> ${escapeHtml(issue.WHY)}</div>`;
            }
            if (issue.RULE) {
              issueHtml += `<div class="cga-issue-rule"><strong>Rule:</strong> ${escapeHtml(issue.RULE)}</div>`;
            }
            if (issue.HELP) {
              issueHtml += `<div class="cga-issue-help">💡 <em>${escapeHtml(issue.HELP)}</em></div>`;
            }
            issueHtml += '</li>';
            return issueHtml;
          }
          return '';
        }).join('')}
      </ul>
    `;
    content.appendChild(issuesList);
  } else if (response.issues) {
    console.error('[Content] issues is not an array:', typeof response.issues, response.issues);
  }

  // Show before/after comparison
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

  // Action buttons
  const actions = document.createElement('div');
  actions.className = 'cga-actions';
  actions.innerHTML = `
    <button class="cga-apply-all-btn">Apply Correction</button>
    <button class="cga-dismiss-btn">Dismiss</button>
  `;
  content.appendChild(actions);

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
    // If it's an object, try to stringify it
    if (typeof text === 'object' && text !== null) {
      console.error('[Content] escapeHtml received object:', text);
      // Try to extract text property if it exists
      if (text.text) return escapeHtml(text.text);
      if (text.message) return escapeHtml(text.message);
      // Otherwise stringify it for debugging
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

  console.log('[Content] Creating suggestion box:', {
    element: element.tagName + '#' + element.id,
    rect: { top: rect.top, bottom: rect.bottom, left: rect.left, width: rect.width },
    position: { top, left, maxWidth },
    windowScroll: { scrollY: window.scrollY, scrollX: window.scrollX }
  });

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
