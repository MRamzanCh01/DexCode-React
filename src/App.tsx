import React, { useState, useEffect } from 'react';
import { TitleBar } from './components/TitleBar';
import { StatusBar } from './components/StatusBar';
import { SidebarNav } from './components/Sidebar/SidebarNav';
import { FileExplorer } from './components/Sidebar/FileExplorer';
import { GlobalSearch } from './components/Sidebar/GlobalSearch';
import { GitPanel } from './components/Sidebar/GitPanel';
import { PluginMarketplace } from './components/Sidebar/PluginMarketplace';
import { SettingsPanel } from './components/Sidebar/SettingsPanel';
import { AiAssistantPanel } from './components/Sidebar/AiAssistantPanel';
import { AcodeSidebarAppHost } from './components/Sidebar/AcodeSidebarAppHost';
import { EditorContainer } from './components/Editor/EditorContainer';
import { TerminalPanel } from './components/Terminal/TerminalPanel';
import { CommandPaletteModal } from './components/Modals/CommandPaletteModal';
import { DiagnosticsModal } from './components/Modals/DiagnosticsModal';
import { AboutModal } from './components/Modals/AboutModal';
import { AcodeDialogModal } from './components/Modals/AcodeDialogModal';
import { AcodeToastContainer } from './components/AcodeToastContainer';

import {
  FileNode,
  TabItem,
  SidebarTab,
  DexCodeSettings,
  DexCodeTheme,
  AcodeDialogState,
  AcodeSidebarApp,
} from './types';
import {
  fetchWorkspaceTree,
  readFileContent,
  writeFileContent,
  createFileSystemItem,
  deleteFileSystemItem,
  renameFileSystemItem,
  detectLanguageFromExtension,
} from './services/fileSystem';
import { getThemeById } from './services/themeManager';
import { loadSettings, saveSettings } from './services/workspaceManager';
import { acodeRuntime } from './services/acodeRuntime';
import { acodePluginManager } from './services/acodePluginManager';

export default function App() {
  // Settings & Theme State
  const [settings, setSettings] = useState<DexCodeSettings>(loadSettings);
  const theme: DexCodeTheme = getThemeById(settings.themeId);

  // Workspace & File Tree State
  const [files, setFiles] = useState<FileNode[]>([]);
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>('explorer');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [acodeSidebarApps, setAcodeSidebarApps] = useState<AcodeSidebarApp[]>([]);

  // Open Tabs & Active Tab
  const [tabs, setTabs] = useState<TabItem[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  // Editor Cursor State
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  // Terminal State
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  // Git State
  const [gitBranch, setGitBranch] = useState('main');
  const [diffMode, setDiffMode] = useState(false);
  const [diffOriginal, setDiffOriginal] = useState('');
  const [diffModified, setDiffModified] = useState('');

  // Status Message
  const [statusMessage, setStatusMessage] = useState('DexCode Ready');

  // Modals & Acode Dialogs
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [acodeDialog, setAcodeDialog] = useState<AcodeDialogState | null>(null);

  // Electron Desktop bridge detection
  const isElectron = typeof window !== 'undefined' && Boolean((window as any).dexcodeDesktop?.isElectron);

  // 1. Initial Load: Fetch Workspace Tree & default file & Acode Plugins
  useEffect(() => {
    refreshWorkspace();

    // Activate enabled Acode plugins
    acodePluginManager.activateAllEnabledPlugins();

    // Setup Acode Dialog Handler
    acodeRuntime.setDialogHandler((dlg) => {
      setAcodeDialog(dlg);
    });

    // Subscribe to dynamic sidebar apps
    setAcodeSidebarApps(acodeRuntime.getSidebarApps());
    const unsubSidebar = acodeRuntime.subscribeSidebarApps(() => {
      setAcodeSidebarApps(acodeRuntime.getSidebarApps());
    });

    // Keybindings listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault();
        setIsTerminalOpen((prev) => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveCurrentFile();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      unsubSidebar();
    };
  }, []);

  // Update Acode Runtime editor bridge whenever tabs or active tab changes
  useEffect(() => {
    acodeRuntime.setEditorBridge(
      null,
      tabs,
      activeTabId,
      handleContentChange,
      handleSaveCurrentFile,
      (idOrPath) => {
        const found = tabs.find((t) => t.id === idOrPath || t.path === idOrPath);
        if (found) {
          setActiveTabId(found.id);
          acodeRuntime.emitEditorEvent('switch-file', found.path);
        } else {
          openFileByPath(idOrPath);
        }
      }
    );
  }, [tabs, activeTabId]);

  // Listen to Desktop IPC menu commands if running in Electron
  useEffect(() => {
    if (isElectron && (window as any).dexcodeDesktop?.onMenuCommand) {
      const cleanup = (window as any).dexcodeDesktop.onMenuCommand((cmd: string) => {
        if (cmd === 'new-file') handleNewTab();
        if (cmd === 'save') handleSaveCurrentFile();
        if (cmd === 'toggle-sidebar') setIsSidebarOpen((prev) => !prev);
        if (cmd === 'toggle-terminal') setIsTerminalOpen((prev) => !prev);
        if (cmd === 'show-about') setIsAboutOpen(true);
      });
      return cleanup;
    }
  }, [isElectron]);

  const refreshWorkspace = async () => {
    const tree = await fetchWorkspaceTree();
    setFiles(tree);

    setTabs((prev) => {
      if (prev.length === 0) {
        // Open default file if no tabs are open
        setTimeout(() => openFileByPath('src/App.tsx'), 0);
      }
      return prev;
    });
  };

  const handleUpdateSettings = (newSettings: Partial<DexCodeSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveSettings(updated);
  };

  // 2. Tab & File Operations
  const openFileByPath = async (relPath: string) => {
    setDiffMode(false);

    // Check if already open
    let existingId: string | null = null;
    setTabs((prev) => {
      const existing = prev.find((t) => t.path === relPath || t.id === relPath);
      if (existing) {
        existingId = existing.id;
      }
      return prev;
    });

    if (existingId) {
      setActiveTabId(existingId);
      acodeRuntime.emitEditorEvent('switch-file', relPath);
      return;
    }

    setStatusMessage(`Opening ${relPath}...`);
    const content = await readFileContent(relPath);
    const fileName = relPath.split('/').pop() || relPath;
    const lang = detectLanguageFromExtension(fileName);

    const newTab: TabItem = {
      id: relPath,
      name: fileName,
      path: relPath,
      content,
      originalContent: content,
      isDirty: false,
      language: lang,
    };

    setTabs((prev) => {
      if (prev.some((t) => t.id === relPath || t.path === relPath)) {
        return prev;
      }
      return [...prev, newTab];
    });
    setActiveTabId(newTab.id);
    setStatusMessage(`Opened ${fileName}`);
    acodeRuntime.emitEditorEvent('switch-file', relPath);
    acodeRuntime.emitEditorEvent('add-file', newTab);
  };

  const handleFileSelect = (node: FileNode) => {
    if (node.type === 'file') {
      openFileByPath(node.path);
    }
  };

  const handleNewTab = () => {
    const uniqueHash = Math.random().toString(36).substring(2, 7);
    const id = `untitled-${Date.now()}-${uniqueHash}`;
    const newTab: TabItem = {
      id,
      name: `Untitled-${uniqueHash}.ts`,
      path: `src/${id}.ts`,
      content: '// New DexCode document\n',
      originalContent: '',
      isDirty: true,
      language: 'typescript',
    };

    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
    acodeRuntime.emitEditorEvent('add-file', newTab);
  };

  const handleCloseTab = (id: string) => {
    const closed = tabs.find((t) => t.id === id);
    const remaining = tabs.filter((t) => t.id !== id);
    setTabs(remaining);

    if (closed) {
      acodeRuntime.emitEditorEvent('remove-file', closed);
    }

    if (activeTabId === id) {
      if (remaining.length > 0) {
        const next = remaining[remaining.length - 1];
        setActiveTabId(next.id);
        acodeRuntime.emitEditorEvent('switch-file', next.path);
      } else {
        setActiveTabId(null);
      }
    }
  };

  const handleContentChange = (newContent: string) => {
    if (!activeTabId) return;

    setTabs((prev) =>
      prev.map((t) => {
        if (t.id === activeTabId) {
          const isDirty = newContent !== t.originalContent;
          return { ...t, content: newContent, isDirty };
        }
        return t;
      })
    );

    acodeRuntime.emitEditorEvent('file-content-changed', newContent);
  };

  const handleSaveCurrentFile = async () => {
    const active = tabs.find((t) => t.id === activeTabId);
    if (!active) return;

    setStatusMessage(`Saving ${active.name}...`);
    const success = await writeFileContent(active.path, active.content);

    if (success) {
      setTabs((prev) =>
        prev.map((t) =>
          t.id === activeTabId ? { ...t, originalContent: t.content, isDirty: false } : t
        )
      );
      setStatusMessage(`Saved ${active.name} successfully`);
      acodeRuntime.emitEditorEvent('save-file', active);
      refreshWorkspace();
    } else {
      setStatusMessage(`Failed to save ${active.name}`);
    }
  };

  // 3. File System CRUD
  const handleCreateFile = async (parentPath: string, fileName: string) => {
    const fullRelPath = parentPath ? `${parentPath}/${fileName}` : fileName;
    await createFileSystemItem(fullRelPath, 'file');
    await refreshWorkspace();
    openFileByPath(fullRelPath);
  };

  const handleCreateFolder = async (parentPath: string, folderName: string) => {
    const fullRelPath = parentPath ? `${parentPath}/${folderName}` : folderName;
    await createFileSystemItem(fullRelPath, 'folder');
    await refreshWorkspace();
  };

  const handleDeleteNode = async (relPath: string) => {
    await deleteFileSystemItem(relPath);
    handleCloseTab(relPath);
    await refreshWorkspace();
  };

  const handleRenameNode = async (oldRelPath: string, newName: string) => {
    const parts = oldRelPath.split('/');
    parts[parts.length - 1] = newName;
    const newRelPath = parts.join('/');

    await renameFileSystemItem(oldRelPath, newRelPath);
    handleCloseTab(oldRelPath);
    await refreshWorkspace();
    openFileByPath(newRelPath);
  };

  // 4. Git Diff Viewer
  const handleOpenDiff = async (filePath: string) => {
    const modifiedContent = await readFileContent(filePath);
    setDiffOriginal(`// Original version of ${filePath}\nimport React from 'react';\n// Previous commit content...`);
    setDiffModified(modifiedContent);
    setDiffMode(true);
    openFileByPath(filePath);
  };

  const activeTab = tabs.find((t) => t.id === activeTabId) || null;
  const activeAcodeSidebarApp = acodeSidebarApps.find((app) => app.id === activeSidebarTab);

  return (
    <div
      className="flex flex-col h-screen w-screen overflow-hidden font-sans select-none"
      style={{
        backgroundColor: theme.colors.background,
        color: theme.colors.textPrimary,
      }}
    >
      {/* Native / Custom DexCode TitleBar */}
      <TitleBar
        theme={theme}
        activeFilePath={activeTab?.path}
        isElectron={isElectron}
        onOpenFolder={refreshWorkspace}
        onSaveFile={handleSaveCurrentFile}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onToggleTerminal={() => setIsTerminalOpen((prev) => !prev)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      {/* Main Workspace Row */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Primary Sidebar Icon Navigation Strip */}
        <SidebarNav
          theme={theme}
          activeTab={activeSidebarTab}
          onTabChange={(tab) => {
            setActiveSidebarTab(tab);
            setIsSidebarOpen(true);
          }}
          uncommittedChangesCount={3}
        />

        {/* Collapsible Panel Content */}
        {isSidebarOpen && (
          <div
            className="w-72 border-r shrink-0 h-full flex flex-col z-10 transition-all overflow-hidden"
            style={{
              backgroundColor: theme.colors.sidebarBackground,
              borderColor: theme.colors.border,
            }}
          >
            {activeSidebarTab === 'explorer' && (
              <FileExplorer
                theme={theme}
                files={files}
                activeFilePath={activeTab?.path}
                onFileSelect={handleFileSelect}
                onOpenFolder={refreshWorkspace}
                onCreateFile={handleCreateFile}
                onCreateFolder={handleCreateFolder}
                onDeleteNode={handleDeleteNode}
                onRenameNode={handleRenameNode}
                onRefresh={refreshWorkspace}
              />
            )}

            {activeSidebarTab === 'search' && (
              <GlobalSearch theme={theme} onOpenResult={(p) => openFileByPath(p)} />
            )}

            {activeSidebarTab === 'git' && (
              <GitPanel
                theme={theme}
                gitBranch={gitBranch}
                onChangeBranch={setGitBranch}
                onOpenDiff={handleOpenDiff}
              />
            )}

            {activeSidebarTab === 'plugins' && <PluginMarketplace theme={theme} />}

            {activeSidebarTab === 'settings' && (
              <SettingsPanel
                theme={theme}
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
              />
            )}

            {activeSidebarTab === 'ai' && (
              <AiAssistantPanel
                theme={theme}
                activeCode={activeTab?.content || ''}
                activeLanguage={activeTab?.language || 'typescript'}
                onApplyCode={handleContentChange}
              />
            )}

            {/* Render Custom Acode Plugin Sidebar App */}
            {activeAcodeSidebarApp && (
              <AcodeSidebarAppHost
                theme={theme}
                app={activeAcodeSidebarApp}
                onClose={() => setActiveSidebarTab('explorer')}
              />
            )}
          </div>
        )}

        {/* Center Main Editor & Terminal Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <EditorContainer
            theme={theme}
            settings={settings}
            tabs={tabs}
            activeTab={activeTab}
            activeTabId={activeTabId}
            onSelectTab={(id) => {
              setActiveTabId(id);
              const t = tabs.find((item) => item.id === id);
              if (t) acodeRuntime.emitEditorEvent('switch-file', t.path);
            }}
            onCloseTab={handleCloseTab}
            onNewTab={handleNewTab}
            onContentChange={handleContentChange}
            onCursorChange={(line, col) => setCursorPos({ line, col })}
            onSaveFile={handleSaveCurrentFile}
            isDiffMode={diffMode}
            diffOriginal={diffOriginal}
            diffModified={diffModified}
          />

          {/* Bottom Integrated Terminal Shell */}
          <TerminalPanel
            theme={theme}
            isOpen={isTerminalOpen}
            onClose={() => setIsTerminalOpen(false)}
            onRunDiagnostics={() => setIsDiagnosticsOpen(true)}
          />
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar
        theme={theme}
        gitBranch={gitBranch}
        modifiedCount={2}
        untrackedCount={1}
        cursorLine={cursorPos.line}
        cursorCol={cursorPos.col}
        language={activeTab?.language || 'typescript'}
        tabSize={settings.tabSize}
        isTerminalOpen={isTerminalOpen}
        onToggleTerminal={() => setIsTerminalOpen((prev) => !prev)}
        statusMessage={statusMessage}
      />

      {/* Modals & Overlays */}
      <CommandPaletteModal
        theme={theme}
        files={files}
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectFile={openFileByPath}
        onRunCheck={() => setIsDiagnosticsOpen(true)}
        onToggleTerminal={() => setIsTerminalOpen((prev) => !prev)}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      <DiagnosticsModal
        theme={theme}
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
      />

      <AboutModal
        theme={theme}
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      {/* Acode Plugin Dialog Modal (Alert, Prompt, Confirm, Select) */}
      <AcodeDialogModal
        theme={theme}
        dialog={acodeDialog}
        onClose={() => setAcodeDialog(null)}
      />

      {/* Acode Plugin Interactive Toast Container */}
      <AcodeToastContainer />
    </div>
  );
}

