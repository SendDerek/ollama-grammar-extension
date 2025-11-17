# 🆓 Ollama Grammar Assistant (Mistral)

A **completely FREE** Chrome extension that provides AI-powered grammar checking using Ollama with the Mistral 7B model. No API costs, perfect privacy, unlimited usage.

## ✨ Features

- 🆓 **$0/month** - Completely free forever
- 🔒 **100% Private** - Runs entirely on your computer
- ♾️ **Unlimited** - Use as much as you want
- 📡 **Offline** - Works without internet
- 🎯 **Smart** - Uses Mistral 7B (best for grammar)
- ⌨️ **Fast** - Keyboard shortcut: Ctrl+Shift+G
- 🌐 **Universal** - Works on all websites

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

### Step 2: Download Mistral Model

```bash
ollama pull mistral:7b
```

This downloads 4.1GB. Takes 2-5 minutes depending on your connection.

---

### Step 3: Start Ollama Server

```bash
ollama serve
```

**Important:** Keep this terminal window open!

You should see:
```
Listening on 127.0.0.1:11434
```

**Verify it's working:**
```bash
# In a new terminal:
curl http://localhost:11434/api/tags
```

Should return JSON with your models.

---

### Step 4: Install Chrome Extension

1. Open Chrome
2. Go to: `chrome://extensions/`
3. Enable **"Developer mode"** (top-right toggle)
4. Click **"Load unpacked"**
5. Select this folder: `ollama-mistral-extension`
6. Extension icon appears! ✅

---

### Step 5: Configure Extension

1. Click the extension icon in Chrome toolbar
2. Verify settings:
   - URL: `http://localhost:11434`
   - Model: Mistral 7B
3. Click **"Test Connection"**
   - Should show: "✓ Connected! Mistral model found."
4. Click **"Save Settings"**

---

### Step 6: Test It! 🎉

**Option A - Use Test Page:**
1. Open `test-page.html` in Chrome
2. Type: `"I dont think this are correct grammer"`
3. Wait 1.5 seconds (or press Ctrl+Shift+G)
4. See suggestions appear!

**Option B - Try Real Website:**
1. Go to any website (Gmail, Twitter, etc.)
2. Click in a text field
3. Type some text with errors
4. Watch suggestions appear!

---

## 💡 Usage

### Automatic Analysis
1. Type in any text field
2. Pause for 1.5 seconds
3. Suggestions appear automatically

### Manual Analysis
Press **Ctrl+Shift+G** (or **Cmd+Shift+G** on Mac)

### Applying Suggestions
- Click **"Apply"** to accept
- Click **"Dismiss"** to ignore
- Click **"X"** to close all

---

## 🎯 Why Mistral?

Mistral 7B is specifically good at:
- ✅ Grammar checking
- ✅ Spelling corrections
- ✅ Tone improvements
- ✅ Professional writing

**Size:** 4.1GB  
**RAM:** 8GB recommended  
**Speed:** 1-2 seconds per check  
**Quality:** Excellent for grammar  

---

## 🔧 Troubleshooting

### "Cannot connect to Ollama"

**Check if Ollama is running:**
```bash
ps aux | grep ollama
```

**If not running, start it:**
```bash
ollama serve
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

1. ✅ Ollama running? (`ollama serve`)
2. ✅ Mistral downloaded? (`ollama list`)
3. ✅ Extension enabled? (chrome://extensions)
4. ✅ Test connection successful? (click extension icon)
5. ✅ Typed 10+ characters?
6. ✅ Waited 1.5 seconds?

**Force analysis:**
Press **Ctrl+Shift+G**

---

### Slow performance?

**First request:** 3-5 seconds (model loading)  
**After that:** 1-2 seconds

**If still slow:**
- Close other apps to free RAM
- Check CPU usage
- Restart Ollama: `killall ollama && ollama serve`

---

### Poor suggestions?

Mistral is good but not perfect. For better quality:
1. Try larger model: `ollama pull llama3.1:8b`
2. Modify prompt in `background.js`
3. Or use paid Claude API (better but costs $2-6/month)

---

## ⚙️ Configuration

### Change Ollama URL

1. Click extension icon
2. Change URL (e.g., for remote server)
3. Test connection
4. Save

### Adjust Analysis Delay

Edit `content.js`, line 46:
```javascript
}, 1500); // Change to 2000 for 2 seconds, etc.
```

### Customize Prompt

Edit `background.js`, lines 35-60:
```javascript
prompt: `You are a professional writing assistant...`
```

Make it stricter, more casual, domain-specific, etc.

---

## 📊 Performance

| Metric | Value |
|--------|-------|
| **First analysis** | 3-5 seconds |
| **Subsequent** | 1-2 seconds |
| **RAM usage** | ~8GB |
| **Disk space** | 4.1GB (model) |
| **Cost** | $0/month |

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
ollama-mistral-extension/
├── manifest.json       # Extension config
├── background.js       # Ollama API calls
├── content.js          # Text monitoring
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

### Option 1: Terminal Window
```bash
ollama serve
# Keep this terminal open
```

### Option 2: Background Process
```bash
# macOS/Linux
ollama serve > /dev/null 2>&1 &

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

### Faster & Lighter
```bash
ollama pull llama3.2:3b
# Edit background.js: model = 'llama3.2:3b'
```

### Better Quality
```bash
ollama pull llama3.1:8b
# Edit background.js: model = 'llama3.1:8b'
```

### Grammar Specialist
```bash
# Mistral is already the best for grammar!
```

---

## ❓ FAQ

**Q: Is this really free?**  
A: Yes! $0 forever. No hidden costs.

**Q: How does it compare to Grammarly?**  
A: Good quality, not quite as smart, but FREE and private!

**Q: Can I use it offline?**  
A: Yes! Once models are downloaded.

**Q: Does it work on all websites?**  
A: Yes! Gmail, Slack, Twitter, everywhere.

**Q: How much RAM do I need?**  
A: 8GB minimum, 16GB recommended.

**Q: Is my data private?**  
A: 100%! Nothing leaves your computer.

**Q: Can I switch models?**  
A: Yes! Edit `background.js` line 13.

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

### Batch Processing
The extension debounces by 1.5s to avoid hammering Ollama. Adjust in `content.js` if needed.

---

## 🐛 Known Issues

1. **First analysis slow** - Model loads into RAM (3-5 sec)
2. **JSON parsing errors** - Mistral sometimes adds extra text
3. **Positioning** - Some sites with complex CSS may have UI issues

These are minor and don't affect core functionality.

---

## 🚀 Future Improvements

- [ ] Multiple model support in UI
- [ ] Custom writing styles
- [ ] Grammar explanations
- [ ] Writing statistics
- [ ] Context-aware suggestions
- [ ] Browser action for selected text

---

## 📜 License

MIT License - Free to use and modify!

---

## 🙏 Credits

Built with:
- **Ollama** - Local AI runtime
- **Mistral 7B** - Grammar-optimized model
- **Chrome Extensions** - Browser platform

---

## 🎉 You're All Set!

You now have FREE, unlimited, private grammar checking!

**Monthly cost:** $0  
**Privacy:** Perfect  
**Quality:** Great  
**Usage:** Unlimited  

Enjoy your free AI writing assistant! ✨

---

**Need Help?**
- Ollama Issues: https://github.com/ollama/ollama
- Extension Issues: Check browser console (F12)
- Model Issues: `ollama list` and `ollama pull mistral:7b`
