import React, { useState } from 'react';
import {
  Code2,
  FolderOpen,
  Save,
  Terminal,
  Settings,
  HelpCircle,
  Minus,
  Square,
  X,
  Play,
  CheckCircle2,
  Sparkles,
  Layers,
  Search,
  Monitor,
} from 'lucide-react';
import { DexCodeTheme } from '../types';

interface TitleBarProps {
  theme: DexCodeTheme;
  activeFilePath?: string;
  isElectron: boolean;
  onOpenFolder: () => void;
  onSaveFile: () => void;
  onToggleSidebar: () => void;
  onToggleTerminal: () => void;
  onOpenCommandPalette: () => void;
  onOpenDiagnostics: () => void;
  onOpenAbout: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  theme,
  activeFilePath,
  isElectron,
  onOpenFolder,
  onSaveFile,
  onToggleSidebar,
  onToggleTerminal,
  onOpenCommandPalette,
  onOpenDiagnostics,
  onOpenAbout,
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const toggleMenu = (menuName: string) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  const handleWindowAction = (action: 'minimize' | 'maximize' | 'close') => {
    if (isElectron && (window as any).dexcodeDesktop) {
      if (action === 'minimize') (window as any).dexcodeDesktop.minimizeWindow();
      if (action === 'maximize') (window as any).dexcodeDesktop.maximizeWindow();
      if (action === 'close') (window as any).dexcodeDesktop.closeWindow();
    }
  };

  return (
    <header
      className="flex items-center justify-between h-9 px-2 text-xs select-none border-b z-50 transition-colors"
      style={{
        backgroundColor: theme.colors.titleBarBackground,
        borderColor: theme.colors.border,
        color: theme.colors.textPrimary,
      }}
    >
      {/* Left Branding & Menus */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 font-bold tracking-wide text-sky-400 mr-2">
          <Code2 className="w-4 h-4 text-sky-400 animate-pulse" />
          <span className="text-sm font-extrabold bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
            DexCode
          </span>
        </div>

        {/* Desktop Menu Bar */}
        <div className="relative flex items-center gap-1">
          {/* File Menu */}
          <div className="relative">
            <button
              onClick={() => toggleMenu('file')}
              className="px-2 py-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
            >
              File
            </button>
            {activeMenu === 'file' && (
              <div
                className="absolute left-0 top-full mt-1 w-48 rounded-md shadow-2xl border py-1 z-50"
                style={{ backgroundColor: theme.colors.sidebarBackground, borderColor: theme.colors.border }}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <button
                  onClick={() => {
                    onSaveFile();
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-sky-500/20"
                >
                  <span className="flex items-center gap-2"><Save className="w-3.5 h-3.5" /> Save File</span>
                  <span className="text-[10px] text-gray-400">Ctrl+S</span>
                </button>
                <button
                  onClick={() => {
                    onOpenFolder();
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-sky-500/20"
                >
                  <span className="flex items-center gap-2"><FolderOpen className="w-3.5 h-3.5" /> Open Folder</span>
                  <span className="text-[10px] text-gray-400">Ctrl+O</span>
                </button>
                <div className="my-1 border-t border-gray-700/50" />
                <button
                  onClick={() => {
                    onOpenDiagnostics();
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-sky-500/20 text-emerald-400"
                >
                  <span className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5" /> Run Check (npm run check)</span>
                </button>
              </div>
            )}
          </div>

          {/* Edit Menu */}
          <div className="relative">
            <button
              onClick={() => toggleMenu('edit')}
              className="px-2 py-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
            >
              Edit
            </button>
            {activeMenu === 'edit' && (
              <div
                className="absolute left-0 top-full mt-1 w-48 rounded-md shadow-2xl border py-1 z-50"
                style={{ backgroundColor: theme.colors.sidebarBackground, borderColor: theme.colors.border }}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <button
                  onClick={() => {
                    onOpenCommandPalette();
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-sky-500/20"
                >
                  <span className="flex items-center gap-2"><Search className="w-3.5 h-3.5" /> Command Palette</span>
                  <span className="text-[10px] text-gray-400">Ctrl+P</span>
                </button>
              </div>
            )}
          </div>

          {/* View Menu */}
          <div className="relative">
            <button
              onClick={() => toggleMenu('view')}
              className="px-2 py-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
            >
              View
            </button>
            {activeMenu === 'view' && (
              <div
                className="absolute left-0 top-full mt-1 w-48 rounded-md shadow-2xl border py-1 z-50"
                style={{ backgroundColor: theme.colors.sidebarBackground, borderColor: theme.colors.border }}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <button
                  onClick={() => {
                    onToggleSidebar();
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-sky-500/20"
                >
                  <span className="flex items-center gap-2"><Layers className="w-3.5 h-3.5" /> Toggle Primary Sidebar</span>
                  <span className="text-[10px] text-gray-400">Ctrl+B</span>
                </button>
                <button
                  onClick={() => {
                    onToggleTerminal();
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-sky-500/20"
                >
                  <span className="flex items-center gap-2"><Terminal className="w-3.5 h-3.5" /> Toggle Terminal</span>
                  <span className="text-[10px] text-gray-400">Ctrl+`</span>
                </button>
              </div>
            )}
          </div>

          {/* Help Menu */}
          <div className="relative">
            <button
              onClick={() => toggleMenu('help')}
              className="px-2 py-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
            >
              Help
            </button>
            {activeMenu === 'help' && (
              <div
                className="absolute left-0 top-full mt-1 w-48 rounded-md shadow-2xl border py-1 z-50"
                style={{ backgroundColor: theme.colors.sidebarBackground, borderColor: theme.colors.border }}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <button
                  onClick={() => {
                    onOpenAbout();
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-sky-500/20"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-sky-400" /> About DexCode Editor
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Center Window Title */}
      <div className="hidden md:flex items-center gap-2 text-gray-400 font-medium truncate max-w-md">
        <span className="text-gray-200">{activeFilePath ? activeFilePath : 'DexCode Desktop Workspace'}</span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Environment Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-semibold">
          <Monitor className="w-3 h-3" />
          <span>{isElectron ? 'DexCode Desktop' : 'DexCode Web Engine'}</span>
        </div>

        {/* Quick Diagnostics trigger */}
        <button
          onClick={onOpenDiagnostics}
          title="Run Project Health Check (npm run check)"
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all text-[11px] font-medium cursor-pointer"
        >
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>Check System</span>
        </button>

        {/* Quick Command Palette trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
          title="Command Palette (Ctrl+P)"
        >
          <Search className="w-3.5 h-3.5" />
        </button>

        {/* Native Electron Window Controls */}
        {isElectron && (
          <div className="flex items-center gap-1 ml-1 border-l border-gray-700/50 pl-1">
            <button
              onClick={() => handleWindowAction('minimize')}
              className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleWindowAction('maximize')}
              className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white"
            >
              <Square className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleWindowAction('close')}
              className="p-1 hover:bg-red-500 hover:text-white rounded text-gray-400 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
