// Background service worker for Ollama local AI calls

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[Background] Received message:', request.type);
  
  if (request.type === 'ANALYZE_TEXT') {
    console.log('[Background] Text to analyze:', request.text.substring(0, 100) + '...');
    
    analyzeTextWithOllama(request.text)
      .then(result => {
        console.log('[Background] Sending response:', result);
        sendResponse(result);
      })
      .catch(error => {
        console.error('[Background] Error occurred:', error);
        sendResponse({ error: error.message });
      });
    return true; // Keep message channel open for async response
  }
});

async function analyzeTextWithOllama(text) {
  // Get settings from storage
  const { ollamaUrl } = await chrome.storage.sync.get(['ollamaUrl']);
  
  const url = ollamaUrl || 'http://localhost:11434';
  const model = 'qwen2.5:3b'; // Using Qwen 2.5 3B - best balance of speed and quality

  const perfStart = performance.now();
  console.log('[Ollama] Starting analysis...');
  console.log('[Ollama] URL:', url);
  console.log('[Ollama] Model:', model);
  console.log('[Ollama] Text length:', text.length);
  
  // Check if Ollama is running
  try {
    console.log('[Ollama] Testing connection to:', `${url}/api/tags`);
    const healthStart = performance.now();
    const healthCheck = await fetch(`${url}/api/tags`, {
      method: 'GET',
    });
    const healthEnd = performance.now();
    console.log(`[Ollama] ⏱️  Health check took: ${(healthEnd - healthStart).toFixed(0)}ms`);

    console.log('[Ollama] Health check status:', healthCheck.status);

    if (!healthCheck.ok) {
      const errorText = await healthCheck.text();
      console.error('[Ollama] Health check failed:', errorText);
      throw new Error(`Ollama server responded with ${healthCheck.status}: ${errorText}`);
    }

    const tagsData = await healthCheck.json();
    console.log('[Ollama] Available models:', tagsData.models?.map(m => m.name));
  } catch (error) {
    console.error('[Ollama] Connection error:', error);
    throw new Error(`Cannot connect to Ollama at ${url}: ${error.message}`);
  }
  
  // Call Ollama API
  try {
    console.log('[Ollama] Calling /api/generate...');
    const requestBody = {
      model: model,
      prompt: `Fix grammar and rewrite for confident, business-casual tone. Remove hedging ("I think", "maybe", "possibly"). Keep contractions ("don't", "can't"). If technical jargon detected, add "businessValue" field with executive-friendly version.

Text: "${text}"

Return ONLY valid JSON:
{"corrected":"fixed text","issues":[{"WHAT":"error description","WHY":"why wrong","RULE":"grammar rule","HELP":"tip"}],"businessValue":"optional: executive translation"}

Rules: No markdown. Only escape ". Don't escape '. If no errors: {"corrected":"${text}","issues":[]}`,
      stream: false,
      options: {
        temperature: 0.1,
        top_p: 0.9,
        num_predict: 400
      }
    };

    console.log('[Ollama] Request body:', JSON.stringify(requestBody, null, 2));

    const genStart = performance.now();
    const response = await fetch(`${url}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    const genEnd = performance.now();
    console.log(`[Ollama] ⏱️  Generation took: ${(genEnd - genStart).toFixed(0)}ms`);

    console.log('[Ollama] Response status:', response.status);
    console.log('[Ollama] Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Ollama] API error response:', errorText);
      throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('[Ollama] Response data:', data);
    
    let responseText = data.response;
    
    if (!responseText) {
      console.error('[Ollama] Empty response from Ollama');
      throw new Error('Empty response from Ollama');
    }
    
    console.log('[Ollama] Raw response text:', responseText);
    
    // Clean up the response - remove markdown and extra text
    responseText = responseText.trim();
    
    // Remove markdown code blocks if present
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Remove any text before the first {
    const firstBrace = responseText.indexOf('{');
    if (firstBrace > 0) {
      responseText = responseText.substring(firstBrace);
    }
    
    // Remove any text after the last }
    const lastBrace = responseText.lastIndexOf('}');
    if (lastBrace > 0 && lastBrace < responseText.length - 1) {
      responseText = responseText.substring(0, lastBrace + 1);
    }
    
    console.log('[Ollama] Cleaned response:', responseText);
    
    // Try to fix common JSON issues
    try {
      // First attempt: parse as-is
      const result = JSON.parse(responseText);
      const perfEnd = performance.now();
      const totalTime = (perfEnd - perfStart).toFixed(0);
      console.log(`[Ollama] ⏱️  TOTAL TIME: ${totalTime}ms`);
      console.log('[Ollama] Parsed result:', result);
      console.log('[Ollama] Corrected text:', result.corrected);
      console.log('[Ollama] Number of issues:', result.issues?.length || 0);
      console.log('[Ollama] Business value:', result.businessValue || 'none');
      return {
        corrected: result.corrected || text,
        issues: result.issues || [],
        businessValue: result.businessValue || null,
        original: text
      };
    } catch (parseError) {
      console.warn('[Ollama] First parse attempt failed, trying to fix JSON...');

      // Try to fix common issues
      let fixedJson = responseText;

      // Fix: Remove trailing commas before } or ]
      fixedJson = fixedJson.replace(/,(\s*[}\]])/g, '$1');

      // Fix: Remove incorrect escaping of single quotes
      // In JSON, single quotes don't need escaping inside double-quoted strings
      fixedJson = fixedJson.replace(/\\'/g, "'");

      // Fix: Ensure backslashes before quotes are properly escaped
      // But don't break already-correct escaping

      console.log('[Ollama] Attempting parse with fixes:', fixedJson);

      try {
        const result = JSON.parse(fixedJson);
        const perfEnd = performance.now();
        const totalTime = (perfEnd - perfStart).toFixed(0);
        console.log('[Ollama] ✓ Parsed with fixes!');
        console.log(`[Ollama] ⏱️  TOTAL TIME: ${totalTime}ms`);
        console.log('[Ollama] Corrected text:', result.corrected);
        console.log('[Ollama] Number of issues:', result.issues?.length || 0);
        console.log('[Ollama] Business value:', result.businessValue || 'none');
        return {
          corrected: result.corrected || text,
          issues: result.issues || [],
          businessValue: result.businessValue || null,
          original: text
        };
      } catch (secondError) {
        console.error('[Ollama] Failed to parse JSON after fixes');
        console.error('[Ollama] Original response:', responseText);
        console.error('[Ollama] Parse error:', secondError.message);

        // Show error to user instead of silently failing
        throw new Error(`Qwen returned invalid JSON. Try pressing Ctrl+Shift+G again or use simpler text.`);
      }
    }
    
  } catch (error) {
    console.error('[Ollama] Error calling API:', error);
    console.error('[Ollama] Error stack:', error.stack);
    throw error;
  }
}

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Ollama Grammar Assistant (Qwen 2.5) installed');
  
  // Set default settings
  chrome.storage.sync.get(['enabled', 'ollamaUrl'], (result) => {
    if (result.enabled === undefined) {
      chrome.storage.sync.set({ enabled: true });
    }
    if (!result.ollamaUrl) {
      chrome.storage.sync.set({ ollamaUrl: 'http://localhost:11434' });
    }
  });
});
