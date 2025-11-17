# 🆓 Ollama Grammar Assistant

A **completely FREE** Chrome extension for **confident, professional writing** using Ollama with Mistral 7B. Eliminates weak language, hedging, and passive voice. No API costs, perfect privacy, unlimited usage.

![Screenshot](screenshot.png)

## ✨ Features

- 🆓 **$0/month** - Completely free forever
- 🔒 **100% Private** - Runs entirely on your computer
- ♾️ **Unlimited** - Use as much as you want
- 📡 **Offline** - Works without internet
- ⚡ **Responsive** - ~4.5 seconds with Mistral 7B
- 💪 **Confident Writing** - Removes hedging, weak qualifiers, passive voice
- 🎯 **Professional Tone** - Eliminates passive-aggressive phrases
- 🤝 **Stays Human** - Keeps warmth and politeness
- ⌨️ **Quick** - Keyboard shortcut: Ctrl+Shift+G
- 🌐 **Universal** - Works on all websites

## 💡 Why This Exists

**TL;DR:** A free, private alternative to Grammarly.

Grammarly costs $12/month ($144/year) and sends all your text to their servers. This extension:
- ✅ **Costs $0/month** - Forever free, no subscriptions
- ✅ **100% Private** - Your text never leaves your computer
- ✅ **No Data Mining** - We don't collect, store, or sell your data
- ✅ **Open Source** - You can see exactly what it does
- ✅ **Unlimited Usage** - Write as much as you want

**Who is this for?**
- Anyone who writes a lot and values privacy
- People tired of subscription fees
- Users who want to keep sensitive documents private
- Anyone learning to write more confidently
- **Anyone who wants to customize their writing assistant** - The prompt is fully customizable!

**The Trade-off:**
Grammarly is more sophisticated, but this extension gives you 80% of the value for 0% of the cost, with 100% privacy.

---

## 🚀 Quick Setup (10 Minutes)

### Step 1: Install Ollama

**macOS:**
```bash
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows:**
Download from [ollama.com/download](https://ollama.com/download)

---

### Step 2: Download Mistral 7B Model

```bash
ollama pull mistral:7b
```

This downloads 4.1GB. Takes 2-5 minutes depending on your connection.

---

### Step 3: Start Ollama Server with CORS Support

**IMPORTANT:** Chrome extensions require CORS support. Start Ollama with this command:

```bash
OLLAMA_ORIGINS="chrome-extension://*" ollama serve
```

**Keep this terminal window open!**

You should see:
```
Listening on 127.0.0.1:11434
```

**Why is this needed?**
Chrome extensions have origins like `chrome-extension://abc123...`. Without setting `OLLAMA_ORIGINS`, Ollama will reject requests from the extension due to CORS (Cross-Origin Resource Sharing) restrictions.

**Verify it's working:**
```bash
# In a new terminal:
curl http://localhost:11434/api/tags
```

Should return JSON with your models.

---

### Step 4: Install Chrome Extension

1. Clone or download this repository
2. Open Chrome and go to: `chrome://extensions/`
3. Enable **"Developer mode"** (top-right toggle)
4. Click **"Load unpacked"**
5. Select the `ollama-grammar-extension` folder
6. Extension icon appears! ✅

---

### Step 5: Configure Extension

1. Click the extension icon in Chrome toolbar
2. Verify settings:
   - URL: `http://localhost:11434`
   - Model: Mistral 7B
3. Click **"Test Connection"**
   - Should show: "✓ Connected! Mistral 7B model found."
4. Click **"Save Settings"**

---

### Step 6: Test It! 🎉

**Option A - Use Test Page:**
1. Open `test-page.html` in Chrome
2. Click an example phrase or type: `"I dont think this are correct grammer"`
3. Wait 0.5 seconds (or press Ctrl+Shift+G)
4. See comprehensive corrections with:
   - ✅ Fixed grammar and spelling
   - ✅ Improved clarity and tone
   - 💡 Educational explanations (WHAT/WHY/RULE/HELP)
5. Click **"Apply Correction"** to fix everything at once!

**Option B - Try Real Website:**
1. Go to any website (Gmail, Slack, etc.)
2. Click in a text field
3. Type some text with errors
4. Watch suggestions appear!

---

## 💡 Usage

### Automatic Analysis
1. Type in any text field
2. Pause for 0.5 seconds
3. Comprehensive corrections appear automatically

### Manual Analysis
Press **Ctrl+Shift+G** (or **Cmd+Shift+G** on Mac)

### One-Click Corrections
- Click **"Apply Correction"** to fix all issues at once
- Click **"Dismiss"** to ignore
- Click **"X"** to close

### What Gets Corrected
- ✅ Grammar errors (verb agreement, articles, etc.)
- ✅ Spelling mistakes
- ✅ Punctuation errors
- ✅ Hedging language ("I think", "maybe", "possibly")
- ✅ Word choice and clarity

### 🎓 Educational Explanations

Each issue includes:
- **WHAT**: Brief description of the error
- **WHY**: Why this is wrong or needs improvement
- **RULE**: The underlying grammar/style rule
- **HELP**: A helpful tip to remember for the future

---

## 🎯 Why Mistral 7B?

Mistral 7B provides excellent tone understanding for confident, professional writing:
- ✅ Confident writing - removes hedging and weak language
- ✅ Professional tone - eliminates passive-aggressive phrases
- ✅ Grammar and spelling corrections
- ✅ Maintains human warmth and politeness
- ✅ Better nuance than smaller models

**Size:** 4.1GB
**RAM:** 8GB minimum, 16GB recommended
**Speed:** ~4.5 seconds per check
**Quality:** Superior tone understanding and professional writing

---

## 🔧 Troubleshooting

### "Cannot connect to Ollama"

**Check if Ollama is running:**
```bash
ps aux | grep ollama
```

**If not running, start it with CORS support:**
```bash
OLLAMA_ORIGINS="chrome-extension://*" ollama serve
```

**Test connection:**
```bash
curl http://localhost:11434/api/tags
```

---

### "Model not found"

**List installed models:**
```bash
ollama list
```

**If Mistral is missing, download it:**
```bash
ollama pull mistral:7b
```

**Verify it's there:**
```bash
ollama list | grep mistral
```

---

### Extension not working?

1. ✅ Ollama running with CORS? (`OLLAMA_ORIGINS="chrome-extension://*" ollama serve`)
2. ✅ Mistral downloaded? (`ollama list | grep mistral`)
3. ✅ Extension enabled? (chrome://extensions)
4. ✅ Test connection successful? (click extension icon)
5. ✅ Typed 10+ characters?
6. ✅ Waited 0.5 seconds?

**Most common issues:**
- Forgetting `OLLAMA_ORIGINS="chrome-extension://*"` when starting Ollama!
- **"Extension was reloaded" error:** If you reload the extension while a page is open, refresh the page (F5) to reconnect.

**Force analysis:**
Press **Ctrl+Shift+G**

**Check performance metrics:**
Open browser console (F12) and look for `⏱️` emoji markers showing:
- Health check time
- Generation time
- Total time

**Check for CORS errors:**
If you see errors like "CORS policy" in the console, restart Ollama with the CORS environment variable.

---

### Slow performance?

**First request:** 5-7 seconds (model loading)
**After that:** ~4.5 seconds

**If still slow:**
- Close other apps to free RAM
- Check CPU usage
- Restart Ollama: `killall ollama && OLLAMA_ORIGINS="chrome-extension://*" ollama serve`
- Ensure you have enough RAM (16GB recommended for Mistral 7B)

---

## ⚙️ Configuration

### Change Ollama URL

1. Click extension icon
2. Change URL (e.g., for remote server)
3. Test connection
4. Save

### Adjust Analysis Delay

Edit `content.js`, line 77:
```javascript
}, 500); // Change to 1000 for 1 second, etc.
```

### Switch to Different Model

Edit `background.js`, line 22:
```javascript
const model = 'mistral:7b'; // Change to other models if needed
```

### 🎨 Customize the Prompt (Make It Yours!)

**The prompt is just a template!** The default focuses on clarity and removing hedging language, but you can customize it for YOUR needs.

Edit `background.js`, line 47-54 to change the prompt.

**Example use cases:**

**For Creative Writing:**
```javascript
prompt: `Fix grammar and improve prose. Make it vivid and engaging. Return JSON...`
```

**For Academic Writing:**
```javascript
prompt: `Fix grammar and make formal/academic. Avoid contractions. Use sophisticated vocabulary. Return JSON...`
```

**For Casual/Friendly Tone:**
```javascript
prompt: `Fix grammar but keep it super casual and friendly. Use contractions, keep personality. Return JSON...`
```

**For Technical Documentation:**
```javascript
prompt: `Fix grammar and make clear/concise for technical documentation. Remove ambiguity. Return JSON...`
```

**For Marketing Copy:**
```javascript
prompt: `Fix grammar and make persuasive/compelling. Focus on benefits and action. Return JSON...`
```

The sky's the limit! Customize it for:
- Your industry/domain
- Your personal writing style
- Your audience
- Your specific goals

---

## 📊 Performance

| Metric | Value |
|--------|-------|
| **First analysis** | 5-7 seconds (model loading) |
| **Subsequent** | ~4.5 seconds |
| **RAM usage** | ~8-12GB |
| **Disk space** | 4.1GB (model) |
| **Cost** | $0/month |
| **Debounce delay** | 0.5 seconds |

**Performance Tracking:**
The extension logs detailed timing metrics in the console:
- ⏱️ Health check time (~15ms)
- ⏱️ Generation time (~4.5s)
- ⏱️ Total time

---

## 🔒 Privacy

With Ollama:
- ✅ All processing on your computer
- ✅ Nothing sent to external servers
- ✅ No data logging
- ✅ Works offline
- ✅ Perfect for sensitive documents

---

## 📁 File Structure

```
ollama-grammar-extension/
├── manifest.json       # Extension config (v1.1.0)
├── background.js       # Ollama API calls + performance tracking
├── content.js          # Text monitoring + UI
├── popup.html          # Settings UI
├── popup.js            # Settings logic
├── styles.css          # Suggestion styling
├── icon16.png          # Extension icons
├── icon48.png
├── icon128.png
├── test-page.html      # Test environment
└── README.md           # This file
```

---

## 🔄 Keeping Ollama Running

**Remember:** Always use `OLLAMA_ORIGINS="chrome-extension://*"` for Chrome extension support!

### Option 1: Terminal Window
```bash
OLLAMA_ORIGINS="chrome-extension://*" ollama serve
# Keep this terminal open
```

### Option 2: Background Process
```bash
# macOS/Linux
OLLAMA_ORIGINS="chrome-extension://*" ollama serve > /dev/null 2>&1 &

# To stop later:
killall ollama
```

### Option 3: System Service
Check Ollama docs for setting up as a system service.

---

## 💰 Cost Comparison

| Solution | Monthly Cost |
|----------|-------------|
| **This Extension** | **$0** ✅ |
| Claude Haiku API | $2-6 |
| Grammarly | $12 |
| Claude Sonnet API | $15-30 |

---

## 🆚 Alternative Models

Want to try different models?

### Current: Mistral 7B (Recommended)
```bash
ollama pull mistral:7b  # Already using this!
# Best for confident, professional writing
```

### Faster Alternative: Qwen 2.5 7B
```bash
ollama pull qwen2.5:7b
# Edit background.js: model = 'qwen2.5:7b'
# Similar quality, slightly faster
```

### Lighter Alternative: Llama 3.2 3B
```bash
ollama pull llama3.2:3b
# Edit background.js: model = 'llama3.2:3b'
# Faster but less nuanced tone understanding
```

---

## ❓ FAQ

**Q: Is this really free?**
A: Yes! $0 forever. No hidden costs.

**Q: How does it compare to Grammarly?**
A: Good quality, not quite as smart, but FREE and private! Plus it translates technical jargon to business speak.

**Q: Can I use it offline?**
A: Yes! Once models are downloaded.

**Q: Does it work on all websites?**
A: Yes! Gmail, Slack, Twitter, everywhere.

**Q: How much RAM do I need?**
A: 8GB minimum, 16GB recommended.

**Q: Is my data private?**
A: 100%! Nothing leaves your computer.

**Q: Can I switch models?**
A: Yes! Edit `background.js` line 22.

**Q: Why Mistral 7B?**
A: Mistral 7B excels at understanding tone and writing nuance, making it ideal for confident, professional writing. It removes weak language effectively while maintaining human warmth.

---

## 🔧 Advanced

### Run Ollama on Different Port
```bash
OLLAMA_HOST=0.0.0.0:8080 ollama serve
```
Then update URL in extension settings.

### Use Remote Ollama Server
1. Set up Ollama on another machine
2. Change URL in extension: `http://192.168.1.100:11434`
3. Test connection

### Performance Optimization
The extension:
- Debounces by 0.5s to avoid hammering Ollama
- Uses optimized prompts (~50 tokens vs 500)
- Limits response to 400 tokens
- Tracks detailed timing metrics

Adjust these in `background.js` if needed.

---

## 🐛 Known Issues

1. **First analysis slow** - Model loads into RAM (3-5 sec)
2. **Test Areas 2 & 3** - Some UI positioning issues on test page (but works on real websites!)

These are minor and don't affect core functionality.

---

## 🚀 Recent Improvements (v1.2.0)

- ✅ **Switched to Mistral 7B** - Superior tone understanding for confident, professional writing
- ✅ **Confident writing focus** - Removes hedging, weak qualifiers, passive voice
- ✅ **Professional + Human** - Maintains warmth and politeness while being assertive
- ✅ **Tone feedback** - Explains confidence and professionalism improvements
- ✅ **One-click corrections** - Apply all fixes at once
- ✅ **Performance tracking** - See exact timings in console (~4.5s)

---

## 📜 License

MIT License - Free to use and modify!

---

## 🙏 Credits

Built with:
- **Ollama** - Local AI runtime
- **Mistral 7B** - Excellent language model for professional writing
- **Chrome Extensions** - Browser platform

---

## 🎉 You're All Set!

You now have FREE, unlimited, private writing assistance with:
- ✅ Confident, professional writing
- ✅ Removes weak language and hedging
- ✅ One-click comprehensive corrections
- 🤝 Maintains human warmth and politeness
- ⚡ Reasonable response times (~4.5s)
- 🎨 Fully customizable prompts

**Monthly cost:** $0
**Privacy:** Perfect
**Quality:** Superior tone understanding
**Usage:** Unlimited

Write with confidence! ✨

---

**Need Help?**
- **GitHub:** https://github.com/SendDerek/ollama-grammar-extension
- **Ollama Issues:** https://github.com/ollama/ollama
- **Extension Issues:** Check browser console (F12) for `⏱️` performance metrics
- **Model Issues:** `ollama list` and `ollama pull mistral:7b`
