// Background service worker for Ollama local AI calls

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'ANALYZE_TEXT') {
    analyzeTextWithOllama(request.text)
      .then(result => {
        sendResponse(result);
      })
      .catch(error => {
        console.error('[Ollama] Error:', error.message);
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

  // Check if Ollama is running
  try {
    const healthStart = performance.now();
    const healthCheck = await fetch(`${url}/api/tags`, {
      method: 'GET',
    });
    const healthEnd = performance.now();
    console.log(`[Ollama] ⏱️  Health check: ${(healthEnd - healthStart).toFixed(0)}ms`);

    if (!healthCheck.ok) {
      throw new Error(`Ollama server responded with ${healthCheck.status}`);
    }

    await healthCheck.json();
  } catch (error) {
    throw new Error(`Cannot connect to Ollama at ${url}. Make sure it's running with CORS support.`);
  }
  
  // Call Ollama API
  try {
    const requestBody = {
      model: model,
      prompt: `Fix grammar and improve clarity. Remove hedging language ("I think", "maybe", "possibly"). Keep natural contractions ("don't", "can't").

Text: "${text}"

Return ONLY valid JSON:
{"corrected":"fixed text","toneFeedback":"description of tone/professionalism changes made"}

Important:
- If you removed hedging words or made it more professional, EXPLAIN what you changed in toneFeedback
- Only set toneFeedback to "" if you ONLY fixed grammar/spelling
- Example toneFeedback: "Removed hedging language ('I think', 'maybe') for a more confident, professional tone"

Rules: No markdown. Only escape ". Don't escape '.`,
      stream: false,
      options: {
        temperature: 0.1,
        top_p: 0.9,
        num_predict: 400
      }
    };

    // Log request for debugging
    console.log('[Ollama] Request prompt:', requestBody.prompt);

    const genStart = performance.now();
    const response = await fetch(`${url}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    const genEnd = performance.now();
    console.log(`[Ollama] ⏱️  Generation: ${(genEnd - genStart).toFixed(0)}ms`);

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }
    
    const data = await response.json();

    let responseText = data.response;

    if (!responseText) {
      throw new Error('Empty response from Ollama');
    }

    // Log raw response for debugging
    console.log('[Ollama] Raw response:', responseText);

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
    
    // Try to fix common JSON issues
    try {
      // First attempt: parse as-is
      const result = JSON.parse(responseText);
      const perfEnd = performance.now();
      console.log(`[Ollama] ⏱️  TOTAL: ${(perfEnd - perfStart).toFixed(0)}ms`);
      return {
        corrected: result.corrected || text,
        toneFeedback: result.toneFeedback || '',
        original: text
      };
    } catch (parseError) {
      // Try to fix common issues
      let fixedJson = responseText;

      // Fix: Remove trailing commas before } or ]
      fixedJson = fixedJson.replace(/,(\s*[}\]])/g, '$1');

      // Fix: Remove incorrect escaping of single quotes
      fixedJson = fixedJson.replace(/\\'/g, "'");

      try {
        const result = JSON.parse(fixedJson);
        const perfEnd = performance.now();
        console.log(`[Ollama] ⏱️  TOTAL: ${(perfEnd - perfStart).toFixed(0)}ms`);
        return {
          corrected: result.corrected || text,
          toneFeedback: result.toneFeedback || '',
          original: text
        };
      } catch (secondError) {
        console.error('[Ollama] Failed to parse JSON:', responseText);
        throw new Error(`Invalid JSON response. Try Ctrl+Shift+G again.`);
      }
    }
    
  } catch (error) {
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
