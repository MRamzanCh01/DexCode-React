export type FileType = 'file' | 'folder';

export interface FileNode {
  id: string;
  name: string;
  path: string;
  fullPath?: string;
  type: FileType;
  children?: FileNode[];
  size?: number;
  isOpen?: boolean;
}

export interface TabItem {
  id: string;
  name: string;
  path: string;
  content: string;
  originalContent: string;
  isDirty: boolean;
  isPinned?: boolean;
  language: string;
  lastModified?: number;
}

export type ThemeType = 'dark' | 'light';

export interface DexCodeTheme {
  id: string;
  name: string;
  type: ThemeType;
  colors: {
    background: string;
    sidebarBackground: string;
    editorBackground: string;
    titleBarBackground: string;
    statusBarBackground: string;
    activeTabBackground: string;
    inactiveTabBackground: string;
    textPrimary: string;
    textSecondary: string;
    accent: string;
    accentHover: string;
    border: string;
    selection: string;
    lineHighlight: string;
  };
}

export interface DexCodeSettings {
  fontSize: number;
  fontFamily: string;
  tabSize: number;
  insertSpaces: boolean;
  wordWrap: 'on' | 'off' | 'wordWrapColumn';
  minimap: boolean;
  autoSave: 'off' | 'afterDelay' | 'onFocusChange';
  autoSaveDelay: number;
  themeId: string;
  lineNumbers: 'on' | 'off' | 'relative';
  formatOnSave: boolean;
  desktopNativeMode: boolean;
  telemetryEnabled: boolean;
}

export interface DexCodePlugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: string;
  downloads: number;
  rating: number;
  icon: string;
  isInstalled?: boolean;
  isEnabled?: boolean;
  entryScript?: string;
  permissions?: string[];
  isAcodePlugin?: boolean;
  readme?: string;
  changelog?: string;
  mainFile?: string;
  repository?: string;
}

export interface AcodePluginAuthor {
  name: string;
  email?: string;
  github?: string;
  url?: string;
}

export interface AcodePluginManifest {
  id: string;
  name: string;
  main: string;
  version: string;
  readme?: string;
  icon?: string;
  files?: string[];
  price?: number;
  author: AcodePluginAuthor | string;
  keywords?: string[];
  description: string;
  changelog?: string;
  minVersionCode?: number;
  settings?: Record<string, any>;
  repository?: string;
}

export interface InstalledAcodePlugin {
  id: string;
  manifest: AcodePluginManifest;
  mainCode: string;
  files: Record<string, string>;
  installedAt: number;
  enabled: boolean;
  source: 'marketplace' | 'zip' | 'url' | 'custom' | 'sample';
  status: 'active' | 'inactive' | 'error';
  error?: string;
  customSettings?: Record<string, any>;
}

export interface AcodeSidebarApp {
  id: string;
  icon: string; // icon name or svg
  title: string;
  mount: (container: HTMLElement) => void;
  unmount?: (container: HTMLElement) => void;
}

export interface AcodePaletteCommand {
  id: string;
  pluginId: string;
  title: string;
  action: () => void;
}

export interface AcodeDialogState {
  isOpen: boolean;
  type: 'alert' | 'confirm' | 'prompt' | 'select' | 'custom';
  title: string;
  message?: string;
  defaultValue?: string;
  options?: { value: string; text: string }[];
  onConfirm?: (value?: string) => void;
  onCancel?: () => void;
}

export interface WorkspaceConfig {
  id: string;
  name: string;
  path: string;
  openTabs: string[];
  activeTabId: string | null;
  expandedFolders: string[];
  createdAt: number;
}

export interface GitFileStatus {
  path: string;
  status: 'modified' | 'untracked' | 'staged' | 'deleted' | 'added';
}

export interface TerminalLog {
  id: string;
  type: 'cmd' | 'output' | 'error' | 'info';
  text: string;
  timestamp: string;
}

export interface SearchResult {
  filePath: string;
  fileName: string;
  line: number;
  content: string;
  matchIndex: number;
  matchLength: number;
}

export type SidebarTab = 'explorer' | 'search' | 'git' | 'plugins' | 'settings' | 'ai' | 'terminal' | string;
