# QUICK START GUIDE - Policy Analysis NLP Module

## 🚀 Installation Steps for macOS M4

### Option 1: Manual Installation (Recommended)

#### 1. Download Ollama
Visit: **https://ollama.ai/download**

Or download directly:
```bash
# Download Ollama for macOS (Apple Silicon)
curl -L https://ollama.ai/download/Ollama-darwin.zip -o ~/Downloads/Ollama.zip
```

#### 2. Install Ollama
1. Open the downloaded `Ollama.zip` file
2. Drag `Ollama.app` to your Applications folder
3. Open Ollama from Applications (it will start automatically)

#### 3. Verify Installation
```bash
# Check if Ollama is installed
ollama --version

# If command not found, add to PATH:
export PATH="/usr/local/bin:$PATH"
```

#### 4. Download the LLM Model
```bash
# Download Llama 3.1 8B (~4.7GB, optimized for M4)
ollama pull llama3.1:8b

# This will take a few minutes depending on your internet speed
```

#### 5. Test Ollama
```bash
# Test the model
ollama run llama3.1:8b "Hello, are you working?"

# Press Ctrl+D to exit the chat
```

#### 6. Install Python Dependencies
```bash
cd policy-ai-engine
pip install -r requirements.txt
```

#### 7. Run the Demo
```bash
# Make sure Ollama is running (it should auto-start)
python main.py
```

### Option 2: Using the Installation Script

```bash
cd policy-ai-engine
./install_ollama.sh
```

---

## ✅ Verification Checklist

- [ ] Ollama installed and running
- [ ] `ollama --version` shows version number
- [ ] `llama3.1:8b` model downloaded
- [ ] Python dependencies installed
- [ ] `python tests/test_all.py` passes
- [ ] `python main.py` runs successfully

---

## 🐛 Common Issues

### Issue: "ollama: command not found"
**Solution:**
```bash
# Add Ollama to PATH
export PATH="/usr/local/bin:$PATH"

# Or add to your ~/.zshrc:
echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Issue: "Connection refused" when running main.py
**Solution:**
```bash
# Make sure Ollama is running
ollama serve

# Or just open the Ollama app from Applications
```

### Issue: Model download is slow
**Solution:**
- Use a faster internet connection
- Or try the smaller Mistral model:
```bash
ollama pull mistral:7b
```
Then update `main.py`:
```python
parser = PolicyParser(model_name="mistral:7b")
```

### Issue: Out of memory on M4
**Solution:**
- Close other applications
- Use the smaller Mistral 7B model instead of Llama 3.1 8B

---

## 📊 Expected Demo Output

When you run `python main.py`, you should see:

```
============================================================
POLICY ANALYSIS NLP MODULE - FREE LOCAL LLM SOLUTION
============================================================

📄 Loading sample policy...
🤖 Initializing Ollama-based parser...
🔍 Initializing ambiguity detector...
💡 Initializing clarification handler...

⚙️  Parsing policy document...
✅ Extracted 2-3 rules

🔍 Detecting ambiguities...
📊 Ambiguity Statistics:
   Total rules: 3
   Clear rules: 1
   Ambiguous rules: 2
   Ambiguity rate: 66.7%

📋 EXTRACTED RULES:
------------------------------------------------------------
[Details of each rule...]

💡 CLARIFICATION NEEDED:
[Questions and suggestions for ambiguous rules...]

💾 Saving results...
✅ Results saved to demo_data/demo_output.json
✅ Clarification report saved to demo_data/clarification_report.json

============================================================
✨ DEMO COMPLETE!
============================================================
```

---

## 🎯 Next Steps

1. **Analyze your own policies**: Replace `sample_policy.txt` with your policy document
2. **Customize ambiguity triggers**: Add domain-specific phrases in `schema.py`
3. **Integrate into your workflow**: Use the modules in your own Python scripts
4. **Experiment with models**: Try different Ollama models for better accuracy

---

## 📞 Need Help?

Check the full README.md for detailed documentation.
