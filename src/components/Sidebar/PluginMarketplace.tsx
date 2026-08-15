import React, { useState, useEffect, useRef } from 'react';
import {
  Blocks,
  Download,
  Star,
  Check,
  Search,
  Power,
  Trash2,
  Sparkles,
  Bot,
  Palette,
  Globe,
  GitBranch,
  Upload,
  Link,
  Code2,
  FileCode2,
  Terminal,
  Play,
  Info,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Layers,
} from 'lucide-react';
import { DexCodePlugin, DexCodeTheme, InstalledAcodePlugin, AcodePluginManifest } from '../../types';
import {
  fetchMarketplacePlugins,
  installPlugin,
  uninstallPlugin,
  togglePluginState,
} from '../../services/pluginSystem';
import { acodePluginManager, CURATED_ACODE_PLUGINS } from '../../services/acodePluginManager';
import { acodeRuntime } from '../../services/acodeRuntime';

interface PluginMarketplaceProps {
  theme: DexCodeTheme;
}

type TabMode = 'marketplace' | 'installed' | 'install' | 'playground';

export const PluginMarketplace: React.FC<PluginMarketplaceProps> = ({ theme }) => {
  const [tabMode, setTabMode] = useState<TabMode>('marketplace');
  const [plugins, setPlugins] = useState<DexCodePlugin[]>([]);
  const [acodePlugins, setAcodePlugins] = useState<InstalledAcodePlugin[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedPluginDoc, setSelectedPluginDoc] = useState<InstalledAcodePlugin | DexCodePlugin | null>(null);

  // Install custom plugin states
  const [urlInput, setUrlInput] = useState('');
  const [installStatus, setInstallStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });

  // Playground states
  const [playgroundCode, setPlaygroundCode] = useState(`// Acode Plugin Live Playground
class MyCustomPlugin {
  async init($page) {
    const { sidebarApps, palette, editorManager, toast } = window;
    
    // 1. Register Command
    palette.register('My Plugin: Greet User', () => {
      toast('Hello from custom Acode plugin!');
    }, 'custom.plugin.hello');
    
    // 2. Add Sidebar App
    sidebarApps.add('Sparkles', 'custom.plugin.app', 'Custom App', (container) => {
      container.innerHTML = \`
        <div class="p-4 space-y-3 text-white">
          <h3 class="font-bold text-sky-400">✨ Custom Acode Sidebar App</h3>
          <p class="text-xs text-gray-300">This panel was created dynamically by your live Acode plugin!</p>
          <button id="test-btn" class="px-3 py-1.5 rounded bg-sky-600 font-bold text-xs cursor-pointer">
            Click Me
          </button>
        </div>
      \`;
      container.querySelector('#test-btn').onclick = () => toast('Button clicked!');
    });
    
    toast('Custom Acode Plugin loaded successfully!');
  }

  async destroy() {
    window.sidebarApps.remove('custom.plugin.app');
  }
}

const myPlugin = new MyCustomPlugin();
acode.setPluginInit('custom.plugin.hello', async () => {
  await myPlugin.init();
});
acode.setPluginUnmount('custom.plugin.hello', () => {
  myPlugin.destroy();
});
`);
  const [playgroundOutput, setPlaygroundOutput] = useState<string>('Ready to execute Acode plugin code.');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    const list = await fetchMarketplacePlugins();
    setPlugins(list);
    setAcodePlugins([...acodePluginManager.getInstalledPlugins()]);
  };

  const handleInstallAcodeFromMarketplace = async (item: DexCodePlugin) => {
    const foundCurated = CURATED_ACODE_PLUGINS.find((p) => p.id === item.id);
    if (foundCurated) {
      const res = await acodePluginManager.installCustomPlugin(
        foundCurated.manifest,
        foundCurated.mainCode,
        foundCurated.files,
        'marketplace'
      );
      if (res.success) {
        setInstallStatus({ type: 'success', message: `Installed ${item.name} successfully!` });
        loadAll();
      } else {
        setInstallStatus({ type: 'error', message: res.error || 'Failed to install' });
      }
    } else {
      installPlugin(item);
      loadAll();
    }
  };

  const handleToggleAcodePlugin = async (id: string) => {
    await acodePluginManager.togglePlugin(id);
    setAcodePlugins([...acodePluginManager.getInstalledPlugins()]);
  };

  const handleUninstallAcodePlugin = async (id: string) => {
    await acodePluginManager.uninstallPlugin(id);
    setAcodePlugins([...acodePluginManager.getInstalledPlugins()]);
  };

  // ZIP Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.name.endsWith('.zip')) {
      setInstallStatus({ type: 'error', message: 'Please select a valid .zip Acode plugin archive.' });
      return;
    }

    setInstallStatus({ type: 'loading', message: `Unpacking ${file.name}...` });
    const result = await acodePluginManager.installFromZipFile(file);

    if (result.success && result.plugin) {
      setInstallStatus({
        type: 'success',
        message: `Successfully installed "${result.plugin.manifest.name}" (v${result.plugin.manifest.version})!`,
      });
      loadAll();
      setTabMode('installed');
    } else {
      setInstallStatus({ type: 'error', message: result.error || 'Failed to unpack Acode zip plugin' });
    }
  };

  // URL Install Handler
  const handleInstallFromUrl = async () => {
    if (!urlInput.trim()) return;

    setInstallStatus({ type: 'loading', message: `Fetching plugin from ${urlInput}...` });
    const result = await acodePluginManager.installFromUrl(urlInput.trim());

    if (result.success && result.plugin) {
      setInstallStatus({
        type: 'success',
        message: `Successfully installed "${result.plugin.manifest.name}"!`,
      });
      setUrlInput('');
      loadAll();
      setTabMode('installed');
    } else {
      setInstallStatus({ type: 'error', message: result.error || 'Failed to install plugin from URL' });
    }
  };

  // Playground Run Handler
  const handleRunPlayground = async () => {
    try {
      setPlaygroundOutput('Executing plugin script...\n');
      const manifest: AcodePluginManifest = {
        id: 'custom.playground.plugin',
        name: 'Live Playground Plugin',
        version: '1.0.0',
        main: 'main.js',
        description: 'Temporary custom plugin running in live playground.',
        author: 'DexCode Developer',
      };

      const res = await acodePluginManager.installCustomPlugin(manifest, playgroundCode, {}, 'custom');
      if (res.success) {
        setPlaygroundOutput((prev) => prev + `[SUCCESS] Acode plugin initialized and running!\nCheck your Command Palette (Ctrl+P) or Sidebar for registered items.`);
        loadAll();
      } else {
        setPlaygroundOutput((prev) => prev + `[ERROR] ` + res.error);
      }
    } catch (err: any) {
      setPlaygroundOutput(`[EXCEPTION] ${err.message}`);
    }
  };

  const categories = ['All', 'Acode Plugins', 'AI & Intelligence', 'Formatters', 'Themes', 'Runners'];

  const filtered = plugins.filter((p) => {
    const matchesCat = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getPluginIcon = (iconName: string) => {
    if (iconName === 'Bot') return <Bot className="w-5 h-5 text-purple-400" />;
    if (iconName === 'Sparkles') return <Sparkles className="w-5 h-5 text-amber-400" />;
    if (iconName === 'Palette') return <Palette className="w-5 h-5 text-pink-400" />;
    if (iconName === 'Globe') return <Globe className="w-5 h-5 text-emerald-400" />;
    if (iconName === 'BarChart3') return <BarChart3 className="w-5 h-5 text-sky-400" />;
    if (iconName === 'Terminal') return <Terminal className="w-5 h-5 text-emerald-400" />;
    return <GitBranch className="w-5 h-5 text-sky-400" />;
  };

  return (
    <div className="flex flex-col h-full text-xs select-none">
      {/* Header */}
      <div
        className="px-3 py-2 border-b font-bold tracking-wider text-[11px] uppercase flex items-center justify-between shrink-0"
        style={{ borderColor: theme.colors.border, color: theme.colors.textSecondary }}
      >
        <span className="flex items-center gap-1.5 text-sky-400">
          <Blocks className="w-3.5 h-3.5" /> Acode & DexCode Plugins
        </span>
        <span className="text-[10px] text-emerald-400 font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
          Acode Engine v1.9
        </span>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center border-b border-gray-800 bg-black/20 shrink-0">
        <button
          onClick={() => setTabMode('marketplace')}
          className={`flex-1 py-2 text-center font-semibold text-[11px] transition-colors cursor-pointer border-b-2 ${
            tabMode === 'marketplace'
              ? 'border-sky-500 text-sky-400 bg-sky-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          Store
        </button>
        <button
          onClick={() => setTabMode('installed')}
          className={`flex-1 py-2 text-center font-semibold text-[11px] transition-colors cursor-pointer border-b-2 relative ${
            tabMode === 'installed'
              ? 'border-sky-500 text-sky-400 bg-sky-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          Installed
          {acodePlugins.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] bg-sky-500/30 text-sky-300">
              {acodePlugins.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTabMode('install')}
          className={`flex-1 py-2 text-center font-semibold text-[11px] transition-colors cursor-pointer border-b-2 ${
            tabMode === 'install'
              ? 'border-sky-500 text-sky-400 bg-sky-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          + Install
        </button>
        <button
          onClick={() => setTabMode('playground')}
          className={`flex-1 py-2 text-center font-semibold text-[11px] transition-colors cursor-pointer border-b-2 ${
            tabMode === 'playground'
              ? 'border-sky-500 text-sky-400 bg-sky-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          Dev Lab
        </button>
      </div>

      {/* TAB 1: MARKETPLACE */}
      {tabMode === 'marketplace' && (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Search & Category filter */}
          <div className="p-2.5 border-b space-y-2 shrink-0" style={{ borderColor: theme.colors.border }}>
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Acode plugins & extensions..."
                className="w-full bg-black/40 border border-gray-700 rounded-md pl-7 pr-2 py-1 text-xs text-white outline-none focus:border-sky-500"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-sky-500 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Plugins List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {filtered.map((plugin) => {
              const isAcodeInstalled = acodePlugins.some((p) => p.id === plugin.id);
              return (
                <div
                  key={plugin.id}
                  className="p-3 rounded-lg bg-black/30 border border-gray-800 hover:border-gray-700 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-white/5 border border-white/10 shrink-0">
                        {getPluginIcon(plugin.icon)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-100 flex items-center gap-1.5">
                          {plugin.name}
                          <span className="text-[9px] text-sky-400 font-mono px-1 rounded bg-sky-500/10">
                            v{plugin.version}
                          </span>
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                          <span>by {plugin.author}</span>
                          {plugin.isAcodePlugin && (
                            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1 rounded">
                              Acode Plugin
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    {isAcodeInstalled || plugin.isInstalled ? (
                      <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px] flex items-center gap-1">
                        <Check className="w-3 h-3" /> Installed
                      </span>
                    ) : (
                      <button
                        onClick={() => handleInstallAcodeFromMarketplace(plugin)}
                        className="px-2.5 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer shrink-0 shadow"
                      >
                        <Download className="w-3 h-3" /> Install
                      </button>
                    )}
                  </div>

                  <p className="text-[11px] text-gray-300 line-clamp-2">{plugin.description}</p>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-gray-800/80">
                    <span className="flex items-center gap-1">
                      <Download className="w-3 h-3 text-sky-400" /> {plugin.downloads.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3 h-3 fill-amber-400" /> {plugin.rating}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: INSTALLED ACODE PLUGINS */}
      {tabMode === 'installed' && (
        <div className="flex flex-col flex-1 overflow-hidden p-2 space-y-2">
          {acodePlugins.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center text-gray-400 space-y-2">
              <Blocks className="w-8 h-8 text-gray-600" />
              <p className="font-semibold text-xs">No Acode plugins currently installed</p>
              <button
                onClick={() => setTabMode('marketplace')}
                className="px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Browse Store
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-2">
              {acodePlugins.map((plugin) => (
                <div
                  key={plugin.id}
                  className={`p-3 rounded-lg border transition-all space-y-2 ${
                    plugin.enabled
                      ? 'bg-black/40 border-gray-800 hover:border-sky-500/40'
                      : 'bg-black/20 border-gray-900 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded bg-sky-500/10 border border-sky-500/20 shrink-0 text-sky-400">
                        <Blocks className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-100 flex items-center gap-1.5">
                          {plugin.manifest.name}
                          <span className="text-[9px] text-sky-400 font-mono px-1 rounded bg-sky-500/10">
                            v{plugin.manifest.version}
                          </span>
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                          <span>
                            by{' '}
                            {typeof plugin.manifest.author === 'string'
                              ? plugin.manifest.author
                              : plugin.manifest.author?.name || 'Acode Author'}
                          </span>
                          <span
                            className={`px-1 py-0.2 rounded text-[9px] font-bold ${
                              plugin.status === 'active'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : plugin.status === 'error'
                                ? 'bg-red-500/20 text-red-300'
                                : 'bg-gray-700 text-gray-400'
                            }`}
                          >
                            {plugin.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleToggleAcodePlugin(plugin.id)}
                        className={`p-1.5 rounded transition-colors cursor-pointer ${
                          plugin.enabled
                            ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                        title={plugin.enabled ? 'Disable Plugin' : 'Enable Plugin'}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setSelectedPluginDoc(plugin)}
                        className="p-1.5 rounded bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                        title="View Plugin Readme"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleUninstallAcodePlugin(plugin.id)}
                        className="p-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                        title="Uninstall Plugin"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-300">{plugin.manifest.description}</p>

                  {plugin.error && (
                    <div className="p-2 rounded bg-red-500/10 border border-red-500/20 text-red-300 text-[10px] font-mono">
                      Error: {plugin.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: INSTALL CUSTOM ACODE PLUGIN */}
      {tabMode === 'install' && (
        <div className="flex flex-col flex-1 overflow-y-auto p-3 space-y-4">
          {/* Option A: Drag & Drop .zip file */}
          <div className="space-y-2">
            <h4 className="font-bold text-gray-200 text-xs flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-sky-400" /> Upload Acode Plugin (.zip)
            </h4>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-700 hover:border-sky-500 rounded-xl p-5 text-center cursor-pointer transition-colors bg-black/20 hover:bg-sky-500/5 space-y-2"
            >
              <Upload className="w-6 h-6 mx-auto text-sky-400" />
              <p className="font-bold text-gray-200 text-xs">Drop or browse .zip archive</p>
              <p className="text-[10px] text-gray-400">
                Supports standard Acode plugin zip packages containing plugin.json & main.js
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Option B: Direct URL */}
          <div className="space-y-2">
            <h4 className="font-bold text-gray-200 text-xs flex items-center gap-1.5">
              <Link className="w-3.5 h-3.5 text-emerald-400" /> Install from Remote URL
            </h4>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://.../plugin.zip or plugin.json"
                className="flex-1 bg-black/50 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-emerald-500 font-mono"
              />
              <button
                onClick={handleInstallFromUrl}
                disabled={!urlInput.trim()}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs transition-colors cursor-pointer shrink-0"
              >
                Fetch
              </button>
            </div>
          </div>

          {/* Status feedback */}
          {installStatus.message && (
            <div
              className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
                installStatus.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : installStatus.type === 'error'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
              }`}
            >
              {installStatus.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
              {installStatus.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}
              {installStatus.type === 'loading' && <Sparkles className="w-4 h-4 shrink-0 animate-spin" />}
              <span>{installStatus.message}</span>
            </div>
          )}

          {/* Quick Install Popular Samples */}
          <div className="space-y-2 pt-2 border-t border-gray-800">
            <h4 className="font-bold text-gray-200 text-xs flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" /> Built-in Acode Samples (1-Click)
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {CURATED_ACODE_PLUGINS.map((curated) => (
                <div
                  key={curated.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-gray-800"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-gray-200 text-[11px]">{curated.manifest.name}</span>
                    <span className="text-[9px] text-gray-400 block">{curated.manifest.id}</span>
                  </div>
                  <button
                    onClick={() => {
                      acodePluginManager.installCustomPlugin(
                        curated.manifest,
                        curated.mainCode,
                        curated.files,
                        'sample'
                      );
                      setInstallStatus({ type: 'success', message: `Installed ${curated.manifest.name}!` });
                      loadAll();
                    }}
                    className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[10px] cursor-pointer transition-colors shrink-0"
                  >
                    + Install
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ACODE DEVELOPER PLAYGROUND */}
      {tabMode === 'playground' && (
        <div className="flex flex-col flex-1 overflow-hidden p-2 space-y-2">
          <div className="flex items-center justify-between shrink-0">
            <span className="font-bold text-gray-200 text-[11px] flex items-center gap-1">
              <Code2 className="w-3.5 h-3.5 text-sky-400" /> Acode Plugin Live Editor
            </span>
            <button
              onClick={handleRunPlayground}
              className="px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer shadow"
            >
              <Play className="w-3 h-3 fill-white" /> Run Plugin
            </button>
          </div>

          <textarea
            value={playgroundCode}
            onChange={(e) => setPlaygroundCode(e.target.value)}
            className="flex-1 w-full p-2.5 rounded-lg bg-black/60 border border-gray-700 font-mono text-[11px] text-sky-300 outline-none resize-none leading-relaxed"
            spellCheck={false}
          />

          {/* Playground Output Logs */}
          <div className="h-28 p-2 rounded-lg bg-black/80 border border-gray-800 font-mono text-[10px] text-gray-300 overflow-y-auto whitespace-pre-wrap shrink-0">
            {playgroundOutput}
          </div>
        </div>
      )}

      {/* Readme Documentation Modal */}
      {selectedPluginDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
          <div
            className="w-full max-w-lg rounded-xl shadow-2xl border overflow-hidden flex flex-col max-h-[85vh] text-xs"
            style={{
              backgroundColor: theme.colors.sidebarBackground,
              borderColor: theme.colors.border,
            }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-black/30">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-sky-400" />
                {'manifest' in selectedPluginDoc
                  ? selectedPluginDoc.manifest.name
                  : selectedPluginDoc.name}
              </span>
              <button
                onClick={() => setSelectedPluginDoc(null)}
                className="text-gray-400 hover:text-white text-xs font-bold px-2 py-1 rounded bg-white/10"
              >
                Close
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-3 whitespace-pre-wrap text-gray-300 font-sans leading-relaxed">
              {'manifest' in selectedPluginDoc && selectedPluginDoc.manifest.readme ? (
                selectedPluginDoc.manifest.readme
              ) : 'description' in selectedPluginDoc ? (
                selectedPluginDoc.description
              ) : (
                'No README provided for this plugin.'
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
