import JSZip from 'jszip';
import {
  AcodePluginManifest,
  InstalledAcodePlugin,
  DexCodePlugin,
} from '../types';
import { acodeRuntime } from './acodeRuntime';

// Curated Real Acode Plugins with authentic Acode plugin lifecycle code
export const CURATED_ACODE_PLUGINS: InstalledAcodePlugin[] = [
  {
    id: 'acode.plugin.colorpicker',
    manifest: {
      id: 'acode.plugin.colorpicker',
      name: 'Acode Color Palette & Swatch Picker',
      version: '1.4.2',
      main: 'main.js',
      description: 'Interactive color picker, palette generator, and HEX/RGB/HSL insertion tool for CSS, Tailwind, and React.',
      author: {
        name: 'Acode Developer Community',
        github: 'acode-community',
      },
      keywords: ['color', 'css', 'palette', 'picker', 'tailwind'],
      icon: 'Palette',
      price: 0,
      readme: `# Acode Color Palette & Picker\n\nA powerful color picking tool that mounts an interactive sidebar panel in DexCode.\n\n### Features\n- Live Color Picker with Hex, RGB, HSL\n- Palette Swatches (Material, Tailwind, Neon, Cyberpunk)\n- 1-Click Code Injection into Active Editor\n- Contrast Checker`,
    },
    mainCode: `
class ColorPickerPlugin {
  async init($page) {
    const { sidebarApps, palette, editorManager, toast, acode } = window;

    // Register Palette Command
    palette.register('Color Picker: Insert Random Hex Color', () => {
      const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
      editorManager.editor.insert(randomColor);
      toast('Inserted color: ' + randomColor);
    }, 'acode.plugin.colorpicker');

    // Register Sidebar App
    sidebarApps.add('Palette', 'acode.plugin.colorpicker.app', 'Color Palette', (container) => {
      container.innerHTML = '';
      container.className = 'p-3 text-xs space-y-4 text-gray-200 overflow-y-auto h-full select-none';

      const header = document.createElement('div');
      header.className = 'font-bold text-sky-400 text-sm flex items-center gap-2 border-b border-gray-800 pb-2';
      header.innerHTML = '<span>🎨</span> Acode Color Studio';
      container.appendChild(header);

      // Color Input
      const pickerWrapper = document.createElement('div');
      pickerWrapper.className = 'space-y-2 p-3 rounded-lg bg-black/40 border border-gray-800';
      pickerWrapper.innerHTML = \`
        <div class="text-[11px] text-gray-400 font-semibold">Custom Color Picker:</div>
        <div class="flex items-center gap-3">
          <input type="color" id="acode-color-input" value="#38bdf8" class="w-10 h-10 rounded border-0 cursor-pointer bg-transparent" />
          <div class="flex-1 space-y-1">
            <div id="acode-hex-label" class="font-mono text-sm font-bold text-white">#38bdf8</div>
            <div class="text-[10px] text-gray-400">Click swatch to insert</div>
          </div>
          <button id="acode-insert-btn" class="px-2.5 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] transition-colors cursor-pointer">
            Insert
          </button>
        </div>
      \`;
      container.appendChild(pickerWrapper);

      const colorInput = pickerWrapper.querySelector('#acode-color-input');
      const hexLabel = pickerWrapper.querySelector('#acode-hex-label');
      const insertBtn = pickerWrapper.querySelector('#acode-insert-btn');

      colorInput.addEventListener('input', (e) => {
        hexLabel.textContent = e.target.value;
      });

      insertBtn.addEventListener('click', () => {
        editorManager.editor.insert(colorInput.value);
        toast('Color inserted into active editor: ' + colorInput.value);
      });

      // Preset Palettes
      const palettesTitle = document.createElement('div');
      palettesTitle.className = 'text-[11px] font-bold uppercase tracking-wider text-gray-400 pt-2';
      palettesTitle.textContent = 'Popular Design Palettes:';
      container.appendChild(palettesTitle);

      const palettes = [
        { name: 'Tailwind Sky', colors: ['#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd'] },
        { name: 'Cyber Neon', colors: ['#ff007f', '#00f0ff', '#7928ca', '#00ff66', '#ffea00'] },
        { name: 'Dracula Purple', colors: ['#282a36', '#44475a', '#6272a4', '#8be9fd', '#50fa7b', '#ff79c6', '#bd93f9'] },
        { name: 'Warm Sunset', colors: ['#f43f5e', '#fb7185', '#fb923c', '#fbbf24', '#facc15'] }
      ];

      palettes.forEach(pal => {
        const palBox = document.createElement('div');
        palBox.className = 'space-y-1.5 p-2 rounded bg-black/20 border border-gray-800';
        
        const title = document.createElement('div');
        title.className = 'text-[10px] font-bold text-gray-400';
        title.textContent = pal.name;
        palBox.appendChild(title);

        const swatches = document.createElement('div');
        swatches.className = 'flex items-center gap-1.5 flex-wrap';
        pal.colors.forEach(col => {
          const swatch = document.createElement('div');
          swatch.className = 'w-6 h-6 rounded cursor-pointer border border-white/20 hover:scale-110 transition-transform';
          swatch.style.backgroundColor = col;
          swatch.title = 'Click to insert ' + col;
          swatch.addEventListener('click', () => {
            editorManager.editor.insert(col);
            toast('Inserted ' + col);
          });
          swatches.appendChild(swatch);
        });
        palBox.appendChild(swatches);
        container.appendChild(palBox);
      });
    });

    toast('Acode Color Picker loaded successfully!');
  }

  async destroy() {
    window.sidebarApps.remove('acode.plugin.colorpicker.app');
  }
}

const colorPlugin = new ColorPickerPlugin();
acode.setPluginInit('acode.plugin.colorpicker', async (baseUrl, $page) => {
  await colorPlugin.init($page);
});
acode.setPluginUnmount('acode.plugin.colorpicker', () => {
  colorPlugin.destroy();
});
    `,
    files: {},
    installedAt: Date.now() - 100000,
    enabled: true,
    source: 'sample',
    status: 'active',
  },
  {
    id: 'acode.plugin.snippets',
    manifest: {
      id: 'acode.plugin.snippets',
      name: 'Acode Code Snippets & Templates Master',
      version: '2.0.1',
      main: 'main.js',
      description: 'Quickly insert boilerplate templates for React, HTML5, TypeScript, Python, and Node.js with a single click or command.',
      author: {
        name: 'Acode Snippet Studio',
        github: 'acode-snippets',
      },
      keywords: ['snippets', 'react', 'templates', 'html', 'typescript'],
      icon: 'Sparkles',
      price: 0,
      readme: `# Acode Code Snippets Library\n\nInstant code snippets for full-stack developers.\n\n### Included Templates\n- React Functional Component (with TypeScript & Tailwind)\n- HTML5 Responsive Starter Page\n- Express REST API Route\n- Async Fetch Handler\n- CSS Flexbox & Grid Centering`,
    },
    mainCode: `
class SnippetsPlugin {
  async init() {
    const { sidebarApps, palette, editorManager, toast } = window;

    const SNIPPETS = [
      {
        title: 'React Functional Component (TSX)',
        code: 'import React from "react";\\n\\ninterface Props {\\n  title: string;\\n}\\n\\nexport const MyComponent: React.FC<Props> = ({ title }) => {\\n  return (\\n    <div className="p-4 rounded-xl bg-slate-900 text-white shadow-lg">\\n      <h2 className="text-xl font-bold">{title}</h2>\\n    </div>\\n  );\\n};\\n'
      },
      {
        title: 'HTML5 Modern Starter Template',
        code: '<!DOCTYPE html>\\n<html lang="en">\\n<head>\\n  <meta charset="UTF-8">\\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\\n  <title>DexCode Web App</title>\\n  <script src="https://cdn.tailwindcss.com"></script>\\n</head>\\n<body class="bg-gray-950 text-white min-h-screen flex items-center justify-center">\\n  <h1 class="text-3xl font-bold text-sky-400">Hello from DexCode & Acode!</h1>\\n</body>\\n</html>\\n'
      },
      {
        title: 'Express REST Endpoint (TypeScript)',
        code: 'app.get("/api/items", async (req, res) => {\\n  try {\\n    const items = [{ id: 1, name: "Sample Item" }];\\n    res.json({ success: true, items });\\n  } catch (error) {\\n    res.status(500).json({ success: false, error: error.message });\\n  }\\n});\\n'
      },
      {
        title: 'Async Fetch API Wrapper',
        code: 'async function fetchData<T>(url: string): Promise<T | null> {\\n  try {\\n    const response = await fetch(url);\\n    if (!response.ok) throw new Error("HTTP error " + response.status);\\n    return await response.json();\\n  } catch (err) {\\n    console.error("Fetch error:", err);\\n    return null;\\n  }\\n}\\n'
      }
    ];

    // Register into Command Palette
    SNIPPETS.forEach(snip => {
      palette.register('Snippet: ' + snip.title, () => {
        editorManager.editor.insert(snip.code);
        toast('Inserted ' + snip.title);
      }, 'acode.plugin.snippets');
    });

    // Register into Sidebar App
    sidebarApps.add('Sparkles', 'acode.plugin.snippets.app', 'Code Snippets', (container) => {
      container.innerHTML = '';
      container.className = 'p-3 text-xs space-y-3 text-gray-200 overflow-y-auto h-full select-none';

      const header = document.createElement('div');
      header.className = 'font-bold text-amber-400 text-sm flex items-center gap-2 border-b border-gray-800 pb-2';
      header.innerHTML = '<span>⚡</span> Acode Snippets Library';
      container.appendChild(header);

      SNIPPETS.forEach(snip => {
        const card = document.createElement('div');
        card.className = 'p-2.5 rounded-lg bg-black/30 border border-gray-800 hover:border-amber-500/40 transition-colors space-y-2';

        const name = document.createElement('div');
        name.className = 'font-bold text-gray-100 flex items-center justify-between';
        name.innerHTML = '<span>' + snip.title + '</span>';

        const btn = document.createElement('button');
        btn.className = 'px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[10px] cursor-pointer transition-colors w-full text-center';
        btn.textContent = '+ Insert into Editor';
        btn.onclick = () => {
          editorManager.editor.insert(snip.code);
          toast('Inserted: ' + snip.title);
        };

        card.appendChild(name);
        card.appendChild(btn);
        container.appendChild(card);
      });
    });

    toast('Acode Snippets Master Active');
  }

  async destroy() {
    window.sidebarApps.remove('acode.plugin.snippets.app');
  }
}

const snippetsPlugin = new SnippetsPlugin();
acode.setPluginInit('acode.plugin.snippets', async () => {
  await snippetsPlugin.init();
});
acode.setPluginUnmount('acode.plugin.snippets', () => {
  snippetsPlugin.destroy();
});
    `,
    files: {},
    installedAt: Date.now() - 80000,
    enabled: true,
    source: 'sample',
    status: 'active',
  },
  {
    id: 'acode.plugin.jsconsole',
    manifest: {
      id: 'acode.plugin.jsconsole',
      name: 'Acode Live JS Console & Scratchpad',
      version: '1.2.0',
      main: 'main.js',
      description: 'Run arbitrary JavaScript code, inspect editorManager state, test regexes, and log output in a live interactive sidebar console.',
      author: {
        name: 'Acode Tools',
        github: 'acode-tools',
      },
      keywords: ['console', 'javascript', 'eval', 'scratchpad', 'devtools'],
      icon: 'Terminal',
      price: 0,
      readme: `# Acode Live JS Console\n\nRun JavaScript expressions directly inside DexCode while accessing the full \`window.editorManager\` and \`window.acode\` API!`,
    },
    mainCode: `
class ConsolePlugin {
  async init() {
    const { sidebarApps, toast, editorManager } = window;

    sidebarApps.add('Terminal', 'acode.plugin.jsconsole.app', 'JS Scratchpad', (container) => {
      container.innerHTML = '';
      container.className = 'p-3 text-xs space-y-3 text-gray-200 overflow-y-auto h-full select-none flex flex-col';

      const header = document.createElement('div');
      header.className = 'font-bold text-emerald-400 text-sm flex items-center gap-2 border-b border-gray-800 pb-2';
      header.innerHTML = '<span>⚡</span> Acode JS Console';
      container.appendChild(header);

      const desc = document.createElement('div');
      desc.className = 'text-[10px] text-gray-400';
      desc.textContent = 'Execute JS code with editorManager & acode in scope:';
      container.appendChild(desc);

      const textarea = document.createElement('textarea');
      textarea.className = 'w-full h-28 p-2 rounded bg-black/60 border border-gray-700 font-mono text-xs text-green-300 outline-none resize-none';
      textarea.value = '// Test Acode API\\nconst active = editorManager.activeFile;\\nconsole.log("Current File:", active ? active.name : "None");\\n"Characters: " + (active ? active.content.length : 0);';
      container.appendChild(textarea);

      const runBtn = document.createElement('button');
      runBtn.className = 'px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer transition-colors';
      runBtn.textContent = '▶ Run Code';
      container.appendChild(runBtn);

      const outputBox = document.createElement('div');
      outputBox.className = 'flex-1 p-2 rounded bg-black/80 border border-gray-800 font-mono text-[11px] text-gray-300 overflow-y-auto whitespace-pre-wrap';
      outputBox.textContent = 'Output will appear here...';
      container.appendChild(outputBox);

      runBtn.onclick = () => {
        try {
          const result = eval(textarea.value);
          outputBox.innerHTML = '<span class="text-emerald-400 font-bold">Result:</span>\\n' + String(result);
          toast('Code evaluated successfully');
        } catch (err) {
          outputBox.innerHTML = '<span class="text-red-400 font-bold">Error:</span>\\n' + err.message;
        }
      };
    });

    toast('Acode JS Scratchpad Loaded');
  }

  async destroy() {
    window.sidebarApps.remove('acode.plugin.jsconsole.app');
  }
}

const consolePlugin = new ConsolePlugin();
acode.setPluginInit('acode.plugin.jsconsole', async () => {
  await consolePlugin.init();
});
acode.setPluginUnmount('acode.plugin.jsconsole', () => {
  consolePlugin.destroy();
});
    `,
    files: {},
    installedAt: Date.now() - 60000,
    enabled: true,
    source: 'sample',
    status: 'active',
  },
  {
    id: 'acode.plugin.wordcount',
    manifest: {
      id: 'acode.plugin.wordcount',
      name: 'Acode Live Word & Document Statistics',
      version: '1.1.0',
      main: 'main.js',
      description: 'Real-time document analyzer providing word count, line count, character count, and estimated reading time.',
      author: {
        name: 'DexCode Analytics',
        github: 'acode-stats',
      },
      keywords: ['wordcount', 'stats', 'analytics', 'counter'],
      icon: 'BarChart3',
      price: 0,
      readme: `# Acode Document Statistics\n\nAnalyzes your active file and provides real-time word, line, and character count.`,
    },
    mainCode: `
class WordCountPlugin {
  async init() {
    const { sidebarApps, editorManager, palette, toast } = window;

    palette.register('Stats: Show Document Word Count', () => {
      const active = editorManager.activeFile;
      if (!active) {
        toast('No active file open');
        return;
      }
      const words = active.content.trim() ? active.content.trim().split(/\\s+/).length : 0;
      const chars = active.content.length;
      const lines = active.content.split('\\n').length;
      toast(\`\${active.name}: \${words} words, \${chars} chars, \${lines} lines\`, 4000);
    }, 'acode.plugin.wordcount');

    sidebarApps.add('BarChart3', 'acode.plugin.wordcount.app', 'Document Stats', (container) => {
      const render = () => {
        const active = editorManager.activeFile;
        container.innerHTML = '';
        container.className = 'p-3 text-xs space-y-3 text-gray-200 overflow-y-auto h-full select-none';

        const header = document.createElement('div');
        header.className = 'font-bold text-sky-400 text-sm flex items-center gap-2 border-b border-gray-800 pb-2';
        header.innerHTML = '<span>📊</span> Document Analytics';
        container.appendChild(header);

        if (!active) {
          container.innerHTML += '<div class="text-gray-500 py-6 text-center">No file active</div>';
          return;
        }

        const words = active.content.trim() ? active.content.trim().split(/\\s+/).length : 0;
        const chars = active.content.length;
        const charsNoSpaces = active.content.replace(/\\s+/g, '').length;
        const lines = active.content.split('\\n').length;
        const readingTime = Math.ceil(words / 200);

        const card = document.createElement('div');
        card.className = 'p-3 rounded-lg bg-black/40 border border-gray-800 space-y-2 text-[11px] font-mono';
        card.innerHTML = \`
          <div class="text-sky-300 font-bold font-sans text-xs border-b border-gray-800 pb-1">\${active.name}</div>
          <div class="flex justify-between"><span class="text-gray-400">Lines:</span> <span class="text-white font-bold">\${lines}</span></div>
          <div class="flex justify-between"><span class="text-gray-400">Words:</span> <span class="text-white font-bold">\${words}</span></div>
          <div class="flex justify-between"><span class="text-gray-400">Characters:</span> <span class="text-white font-bold">\${chars}</span></div>
          <div class="flex justify-between"><span class="text-gray-400">Without Spaces:</span> <span class="text-white font-bold">\${charsNoSpaces}</span></div>
          <div class="flex justify-between"><span class="text-gray-400">Reading Time:</span> <span class="text-emerald-400 font-bold">~\${readingTime} min</span></div>
        \`;
        container.appendChild(card);
      };

      render();
      editorManager.on('file-content-changed', render);
      editorManager.on('switch-file', render);
    });

    toast('Acode Document Statistics Loaded');
  }

  async destroy() {
    window.sidebarApps.remove('acode.plugin.wordcount.app');
  }
}

const wordCountPlugin = new WordCountPlugin();
acode.setPluginInit('acode.plugin.wordcount', async () => {
  await wordCountPlugin.init();
});
acode.setPluginUnmount('acode.plugin.wordcount', () => {
  wordCountPlugin.destroy();
});
    `,
    files: {},
    installedAt: Date.now() - 40000,
    enabled: true,
    source: 'sample',
    status: 'active',
  },
];

const STORAGE_KEY = 'dexcode_acode_installed_plugins';

export class AcodePluginManager {
  private plugins: InstalledAcodePlugin[] = [];

  constructor() {
    this.loadFromStorage();
  }

  public loadFromStorage(): InstalledAcodePlugin[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.plugins = JSON.parse(raw);
      } else {
        this.plugins = [...CURATED_ACODE_PLUGINS];
        this.saveToStorage();
      }
    } catch (err) {
      console.error('Failed to load Acode plugins from storage', err);
      this.plugins = [...CURATED_ACODE_PLUGINS];
    }
    return this.plugins;
  }

  public saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.plugins));
    } catch (err) {
      console.error('Failed to persist Acode plugins', err);
    }
  }

  public getInstalledPlugins(): InstalledAcodePlugin[] {
    return this.plugins;
  }

  public getPlugin(id: string): InstalledAcodePlugin | undefined {
    return this.plugins.find((p) => p.id === id);
  }

  // Auto-activate all enabled plugins on application startup
  public async activateAllEnabledPlugins(): Promise<void> {
    for (const plugin of this.plugins) {
      if (plugin.enabled && plugin.status !== 'error') {
        const res = await acodeRuntime.activatePlugin(plugin);
        plugin.status = res.success ? 'active' : 'error';
        if (!res.success) plugin.error = res.error;
      }
    }
    this.saveToStorage();
  }

  // Toggle enable/disable
  public async togglePlugin(id: string): Promise<InstalledAcodePlugin[]> {
    const plugin = this.plugins.find((p) => p.id === id);
    if (!plugin) return this.plugins;

    if (plugin.enabled) {
      await acodeRuntime.deactivatePlugin(id);
      plugin.enabled = false;
      plugin.status = 'inactive';
    } else {
      plugin.enabled = true;
      const res = await acodeRuntime.activatePlugin(plugin);
      plugin.status = res.success ? 'active' : 'error';
      if (!res.success) plugin.error = res.error;
    }

    this.saveToStorage();
    return [...this.plugins];
  }

  // Uninstall plugin
  public async uninstallPlugin(id: string): Promise<InstalledAcodePlugin[]> {
    await acodeRuntime.deactivatePlugin(id);
    this.plugins = this.plugins.filter((p) => p.id !== id);
    this.saveToStorage();
    return [...this.plugins];
  }

  // Install custom plugin from raw manifest + code
  public async installCustomPlugin(
    manifest: AcodePluginManifest,
    mainCode: string,
    files: Record<string, string> = {},
    source: 'custom' | 'url' | 'zip' | 'marketplace' | 'sample' = 'custom'
  ): Promise<{ success: boolean; plugin?: InstalledAcodePlugin; error?: string }> {
    try {
      if (!manifest.id || !manifest.name) {
        return { success: false, error: 'Plugin manifest must contain valid "id" and "name".' };
      }

      // Check if already installed, uninstall old first
      const existing = this.plugins.find((p) => p.id === manifest.id);
      if (existing) {
        await this.uninstallPlugin(manifest.id);
      }

      const newPlugin: InstalledAcodePlugin = {
        id: manifest.id,
        manifest,
        mainCode,
        files,
        installedAt: Date.now(),
        enabled: true,
        source,
        status: 'inactive',
      };

      const res = await acodeRuntime.activatePlugin(newPlugin);
      newPlugin.status = res.success ? 'active' : 'error';
      if (!res.success) newPlugin.error = res.error;

      this.plugins.push(newPlugin);
      this.saveToStorage();

      return { success: true, plugin: newPlugin };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to install plugin' };
    }
  }

  // Install from Zip File (using JSZip)
  public async installFromZipFile(file: File): Promise<{ success: boolean; plugin?: InstalledAcodePlugin; error?: string }> {
    try {
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(file);

      // Look for plugin.json in root or subfolder
      let manifestFile = zipContent.file('plugin.json');
      let rootPrefix = '';

      if (!manifestFile) {
        // Search in subdirectories
        const found = Object.keys(zipContent.files).find((k) => k.endsWith('plugin.json'));
        if (found) {
          manifestFile = zipContent.file(found);
          rootPrefix = found.replace('plugin.json', '');
        }
      }

      if (!manifestFile) {
        return { success: false, error: 'Invalid Acode plugin zip: "plugin.json" not found in archive.' };
      }

      const manifestText = await manifestFile.async('text');
      const manifest: AcodePluginManifest = JSON.parse(manifestText);

      const mainFileName = manifest.main || 'main.js';
      const mainFile = zipContent.file(rootPrefix + mainFileName);

      if (!mainFile) {
        return { success: false, error: `Invalid Acode plugin zip: Entry file "${mainFileName}" not found.` };
      }

      const mainCode = await mainFile.async('text');

      // Extract extra files (readme.md, icon, etc.)
      const files: Record<string, string> = {};
      for (const [filename, fileObj] of Object.entries(zipContent.files)) {
        if (!fileObj.dir && !filename.endsWith('.png') && !filename.endsWith('.jpg')) {
          const relName = filename.replace(rootPrefix, '');
          files[relName] = await fileObj.async('text');
        }
      }

      // Check if readme.md in files
      if (!manifest.readme && files['readme.md']) {
        manifest.readme = files['readme.md'];
      }

      return await this.installCustomPlugin(manifest, mainCode, files, 'zip');
    } catch (err: any) {
      console.error('Error unpacking Acode zip plugin:', err);
      return { success: false, error: 'Failed to unpack zip: ' + (err.message || String(err)) };
    }
  }

  // Install from Remote URL (ZIP or JSON)
  public async installFromUrl(url: string): Promise<{ success: boolean; plugin?: InstalledAcodePlugin; error?: string }> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        return { success: false, error: `Failed to fetch URL: HTTP ${response.status}` };
      }

      const contentType = response.headers.get('content-type') || '';

      if (url.endsWith('.zip') || contentType.includes('zip') || contentType.includes('octet-stream')) {
        const blob = await response.blob();
        const file = new File([blob], 'plugin.zip');
        return await this.installFromZipFile(file);
      } else {
        // Assume JSON or JS
        const json = await response.json();
        if (json.id && json.mainCode) {
          return await this.installCustomPlugin(json.manifest || json, json.mainCode, {}, 'url');
        } else if (json.id && json.name) {
          // Fetch main file if URL available
          return { success: false, error: 'Provide a complete plugin package or zip archive URL.' };
        }
        return { success: false, error: 'Unrecognized plugin format.' };
      }
    } catch (err: any) {
      return { success: false, error: 'Network error fetching plugin: ' + err.message };
    }
  }
}

export const acodePluginManager = new AcodePluginManager();
