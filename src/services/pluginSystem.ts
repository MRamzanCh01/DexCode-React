import { DexCodePlugin } from '../types';

const INITIAL_INSTALLED_PLUGINS: DexCodePlugin[] = [
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
    isInstalled: true,
    isEnabled: true,
    permissions: ['ai:generate', 'editor:read', 'editor:write'],
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
    isInstalled: true,
    isEnabled: true,
    permissions: ['editor:format'],
  },
];

export function getInstalledPlugins(): DexCodePlugin[] {
  try {
    const raw = localStorage.getItem('dexcode_installed_plugins');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to parse installed plugins from storage', err);
  }
  return INITIAL_INSTALLED_PLUGINS;
}

export function saveInstalledPlugins(plugins: DexCodePlugin[]): void {
  try {
    localStorage.setItem('dexcode_installed_plugins', JSON.stringify(plugins));
  } catch (err) {
    console.error('Failed to persist installed plugins', err);
  }
}

export async function fetchMarketplacePlugins(): Promise<DexCodePlugin[]> {
  try {
    const res = await fetch('/api/plugins/marketplace');
    const data = await res.json();
    if (data.success && Array.isArray(data.plugins)) {
      const installed = getInstalledPlugins();
      const installedMap = new Map(installed.map((p) => [p.id, p]));

      return data.plugins.map((p: DexCodePlugin) => {
        const inst = installedMap.get(p.id);
        return {
          ...p,
          isInstalled: Boolean(inst),
          isEnabled: inst ? inst.isEnabled : true,
        };
      });
    }
  } catch (err) {
    console.warn('Failed to fetch marketplace plugins, using local fallback', err);
  }

  const installed = getInstalledPlugins();
  return installed;
}

export function installPlugin(plugin: DexCodePlugin): DexCodePlugin[] {
  const current = getInstalledPlugins();
  const exists = current.find((p) => p.id === plugin.id);
  let updated: DexCodePlugin[];

  if (exists) {
    updated = current.map((p) => (p.id === plugin.id ? { ...p, isInstalled: true, isEnabled: true } : p));
  } else {
    updated = [...current, { ...plugin, isInstalled: true, isEnabled: true }];
  }

  saveInstalledPlugins(updated);
  return updated;
}

export function uninstallPlugin(pluginId: string): DexCodePlugin[] {
  const current = getInstalledPlugins();
  const updated = current.filter((p) => p.id !== pluginId);
  saveInstalledPlugins(updated);
  return updated;
}

export function togglePluginState(pluginId: string): DexCodePlugin[] {
  const current = getInstalledPlugins();
  const updated = current.map((p) => (p.id === pluginId ? { ...p, isEnabled: !p.isEnabled } : p));
  saveInstalledPlugins(updated);
  return updated;
}
