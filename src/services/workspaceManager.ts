import { DexCodeSettings, WorkspaceConfig } from '../types';

export const DEFAULT_SETTINGS: DexCodeSettings = {
  fontSize: 14,
  fontFamily: "'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
  tabSize: 2,
  insertSpaces: true,
  wordWrap: 'on',
  minimap: true,
  autoSave: 'afterDelay',
  autoSaveDelay: 2000,
  themeId: 'dexcode-dark',
  lineNumbers: 'on',
  formatOnSave: true,
  desktopNativeMode: true,
  telemetryEnabled: false,
};

export function loadSettings(): DexCodeSettings {
  try {
    const raw = localStorage.getItem('dexcode_settings');
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.error('Failed to load settings', err);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: DexCodeSettings): void {
  try {
    localStorage.setItem('dexcode_settings', JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings', err);
  }
}

export function loadRecentWorkspaces(): WorkspaceConfig[] {
  try {
    const raw = localStorage.getItem('dexcode_recent_workspaces');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to load recent workspaces', err);
  }

  return [
    {
      id: 'ws-dexcode-core',
      name: 'DexCode Workspace',
      path: '/workspace/dexcode',
      openTabs: ['src/App.tsx', 'README.md'],
      activeTabId: 'src/App.tsx',
      expandedFolders: ['src', 'electron'],
      createdAt: Date.now() - 86400000,
    },
    {
      id: 'ws-sample-react',
      name: 'React Web App',
      path: '/workspace/react-demo',
      openTabs: ['src/main.tsx'],
      activeTabId: 'src/main.tsx',
      expandedFolders: ['src'],
      createdAt: Date.now() - 172800000,
    },
  ];
}
