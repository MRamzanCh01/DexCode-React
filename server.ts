import express from 'express';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initial default workspace directory
const WORKSPACE_DIR = process.cwd();

// --- 1. HEALTH & DIAGNOSTICS ENDPOINTS ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'DexCode Server', version: '1.0.0', time: new Date().toISOString() });
});

app.get('/api/check', (req, res) => {
  const checks = {
    packageJson: fs.existsSync(path.join(WORKSPACE_DIR, 'package.json')),
    tsconfig: fs.existsSync(path.join(WORKSPACE_DIR, 'tsconfig.json')),
    viteConfig: fs.existsSync(path.join(WORKSPACE_DIR, 'vite.config.ts')),
    electronMain: fs.existsSync(path.join(WORKSPACE_DIR, 'electron/main.js')),
    nodeVersion: process.version,
    envGemini: Boolean(process.env.GEMINI_API_KEY),
  };
  res.json({ success: true, checks });
});

// --- 2. WORKSPACE FILE SYSTEM API ---
function buildTree(dirPath, relativeDir = '') {
  try {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    const result = [];

    for (const item of items) {
      // Ignore build / system directories
      if (['node_modules', '.git', 'dist', 'dist-desktop', '.aistudio'].includes(item.name)) {
        continue;
      }

      const itemRelPath = path.join(relativeDir, item.name);
      const fullPath = path.join(dirPath, item.name);

      if (item.isDirectory()) {
        result.push({
          id: itemRelPath,
          name: item.name,
          path: itemRelPath,
          fullPath: fullPath,
          type: 'folder',
          children: buildTree(fullPath, itemRelPath),
        });
      } else {
        result.push({
          id: itemRelPath,
          name: item.name,
          path: itemRelPath,
          fullPath: fullPath,
          type: 'file',
          size: fs.statSync(fullPath).size,
        });
      }
    }
    return result;
  } catch (err) {
    return [];
  }
}

app.get('/api/files/tree', (req, res) => {
  try {
    const tree = buildTree(WORKSPACE_DIR);
    res.json({ success: true, rootName: path.basename(WORKSPACE_DIR), tree });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/files/read', (req, res) => {
  try {
    const { relPath } = req.body;
    const targetPath = path.resolve(WORKSPACE_DIR, relPath);
    if (!targetPath.startsWith(WORKSPACE_DIR)) {
      return res.status(403).json({ success: false, error: 'Access denied outside workspace' });
    }
    const content = fs.readFileSync(targetPath, 'utf8');
    res.json({ success: true, content, path: relPath });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/files/write', (req, res) => {
  try {
    const { relPath, content } = req.body;
    const targetPath = path.resolve(WORKSPACE_DIR, relPath);
    if (!targetPath.startsWith(WORKSPACE_DIR)) {
      return res.status(403).json({ success: false, error: 'Access denied outside workspace' });
    }
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, content, 'utf8');
    res.json({ success: true, path: relPath });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/files/create', (req, res) => {
  try {
    const { relPath, type } = req.body;
    const targetPath = path.resolve(WORKSPACE_DIR, relPath);
    if (type === 'folder') {
      fs.mkdirSync(targetPath, { recursive: true });
    } else {
      fs.mkdirSync(path.dirname(targetPath), { recursive: true });
      if (!fs.existsSync(targetPath)) {
        fs.writeFileSync(targetPath, '', 'utf8');
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/files/delete', (req, res) => {
  try {
    const { relPath } = req.body;
    const targetPath = path.resolve(WORKSPACE_DIR, relPath);
    if (fs.existsSync(targetPath)) {
      fs.rmSync(targetPath, { recursive: true, force: true });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/files/rename', (req, res) => {
  try {
    const { oldRelPath, newRelPath } = req.body;
    const oldPath = path.resolve(WORKSPACE_DIR, oldRelPath);
    const newPath = path.resolve(WORKSPACE_DIR, newRelPath);
    fs.renameSync(oldPath, newPath);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- 3. TERMINAL RUNNER API ---
app.post('/api/terminal/run', (req, res) => {
  const { command } = req.body;
  if (!command) {
    return res.status(400).json({ error: 'Command is required' });
  }

  // Prevent dangerous rm -rf / commands
  if (command.includes('rm -rf /') || command.includes(':(){ :|:& };:')) {
    return res.json({ success: false, output: 'Command blocked for security.' });
  }

  exec(command, { cwd: WORKSPACE_DIR, timeout: 30000 }, (error, stdout, stderr) => {
    res.json({
      success: !error,
      output: (stdout || '') + (stderr || '') + (error ? `\nExit code: ${error.code}` : ''),
    });
  });
});

// --- 4. PLUGIN & ACODE EXTENSION MARKETPLACE REGISTRY API ---
const FEATURED_PLUGINS = [
  {
    id: 'acode.plugin.colorpicker',
    name: 'Acode Color Palette & Swatch Picker',
    version: '1.4.2',
    description: 'Interactive color picker, palette generator, and HEX/RGB/HSL insertion tool for CSS, Tailwind, and React.',
    author: 'Acode Developer Community',
    category: 'Acode Plugins',
    downloads: 32400,
    rating: 4.9,
    icon: 'Palette',
    isAcodePlugin: true,
  },
  {
    id: 'acode.plugin.snippets',
    name: 'Acode Code Snippets & Templates Master',
    version: '2.0.1',
    description: 'Quickly insert boilerplate templates for React, HTML5, TypeScript, Python, and Node.js with a single click.',
    author: 'Acode Snippet Studio',
    category: 'Acode Plugins',
    downloads: 41200,
    rating: 5.0,
    icon: 'Sparkles',
    isAcodePlugin: true,
  },
  {
    id: 'acode.plugin.jsconsole',
    name: 'Acode Live JS Console & Scratchpad',
    version: '1.2.0',
    description: 'Run arbitrary JavaScript code, inspect editorManager state, test regexes, and log output in a live interactive sidebar console.',
    author: 'Acode Tools',
    category: 'Acode Plugins',
    downloads: 28900,
    rating: 4.8,
    icon: 'Terminal',
    isAcodePlugin: true,
  },
  {
    id: 'acode.plugin.wordcount',
    name: 'Acode Live Word & Document Statistics',
    version: '1.1.0',
    description: 'Real-time document analyzer providing word count, line count, character count, and estimated reading time.',
    author: 'DexCode Analytics',
    category: 'Acode Plugins',
    downloads: 19500,
    rating: 4.7,
    icon: 'BarChart3',
    isAcodePlugin: true,
  },
  {
    id: 'dexcode-prettier',
    name: 'Prettier Code Formatter',
    version: '2.1.0',
    description: 'Enforces consistent style by parsing your code and re-printing it with custom rules.',
    author: 'DexCode Core',
    category: 'Formatters',
    downloads: 14200,
    rating: 4.9,
    icon: 'Sparkles',
  },
  {
    id: 'dexcode-gemini-assistant',
    name: 'Gemini AI Coding Assistant',
    version: '1.5.0',
    description: 'Smart code completion, refactoring, unit test generation, and bug fixing powered by Gemini 2.5.',
    author: 'Google AI Studio',
    category: 'AI & Intelligence',
    downloads: 28900,
    rating: 5.0,
    icon: 'Bot',
  },
  {
    id: 'dexcode-synthwave-theme',
    name: 'Synthwave 84 Cyber Theme',
    version: '1.0.4',
    description: 'A neon-drenched retro dark theme inspired by 1980s aesthetic art.',
    author: 'DexCode Aesthetics',
    category: 'Themes',
    downloads: 8700,
    rating: 4.8,
    icon: 'Palette',
  },
  {
    id: 'dexcode-live-server',
    name: 'Live Web Previewer',
    version: '1.2.1',
    description: 'Launch a local web preview window with instant reload for HTML, CSS, and React apps.',
    author: 'DexCode Core',
    category: 'Runners',
    downloads: 11500,
    rating: 4.7,
    icon: 'Globe',
  },
  {
    id: 'dexcode-git-lens',
    name: 'GitLens Supercharged',
    version: '3.0.1',
    description: 'In-line git blame annotations, commit graph visualization, and branch comparison.',
    author: 'DevTools Lab',
    category: 'Source Control',
    downloads: 19800,
    rating: 4.9,
    icon: 'GitBranch',
  },
];

app.get('/api/plugins/marketplace', (req, res) => {
  res.json({ success: true, plugins: FEATURED_PLUGINS });
});

// --- 5. GEMINI AI ASSISTANT API ---
let aiClient: GoogleGenAI | null = null;
function getAiClient() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

app.post('/api/ai/assistant', async (req, res) => {
  try {
    const { mode, code, prompt, language } = req.body;
    const ai = getAiClient();

    if (!ai) {
      return res.status(400).json({
        success: false,
        error: 'Gemini API key is missing. Set GEMINI_API_KEY in secrets/environment.',
      });
    }

    let systemInstruction = 'You are DexCode AI, an expert programming assistant built into the DexCode editor.';
    let userPrompt = '';

    if (mode === 'explain') {
      userPrompt = `Explain this ${language || 'code'} clearly and concisely:\n\`\`\`\n${code}\n\`\`\``;
    } else if (mode === 'refactor') {
      userPrompt = `Refactor and improve this ${language || 'code'} for readability, modern practices, and efficiency. Return ONLY the improved code inside standard code blocks:\n\`\`\`\n${code}\n\`\`\``;
    } else if (mode === 'fix') {
      userPrompt = `Find and fix any potential bugs, edge cases, or syntax errors in this ${language || 'code'}. Explain briefly what was fixed, followed by the corrected code:\n\`\`\`\n${code}\n\`\`\``;
    } else if (mode === 'test') {
      userPrompt = `Write complete unit tests for this ${language || 'code'}:\n\`\`\`\n${code}\n\`\`\``;
    } else {
      userPrompt = `${prompt || 'Help with code'}:\n\`\`\`\n${code || ''}\n\`\`\``;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    res.json({ success: true, text: response.text });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- 6. START VITE OR SERVE STATIC DIST ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 DexCode Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
