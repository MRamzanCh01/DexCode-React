import React, { useState, useEffect } from 'react';
import {
  FolderTree,
  Search,
  GitBranch,
  Blocks,
  Settings,
  Sparkles,
  Terminal,
  Palette,
  BarChart3,
  FileCode,
  Globe,
  Layers,
} from 'lucide-react';
import { SidebarTab, DexCodeTheme, AcodeSidebarApp } from '../../types';
import { acodeRuntime } from '../../services/acodeRuntime';

interface SidebarNavProps {
  theme: DexCodeTheme;
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  uncommittedChangesCount: number;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  theme,
  activeTab,
  onTabChange,
  uncommittedChangesCount,
}) => {
  const [acodeApps, setAcodeApps] = useState<AcodeSidebarApp[]>([]);

  useEffect(() => {
    setAcodeApps(acodeRuntime.getSidebarApps());
    const unsub = acodeRuntime.subscribeSidebarApps(() => {
      setAcodeApps(acodeRuntime.getSidebarApps());
    });
    return () => unsub();
  }, []);

  const navItems: { id: SidebarTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'explorer', label: 'File Explorer (Ctrl+Shift+E)', icon: <FolderTree className="w-5 h-5" /> },
    { id: 'search', label: 'Search Workspace (Ctrl+Shift+F)', icon: <Search className="w-5 h-5" /> },
    {
      id: 'git',
      label: 'Source Control (Ctrl+Shift+G)',
      icon: <GitBranch className="w-5 h-5" />,
      badge: uncommittedChangesCount > 0 ? uncommittedChangesCount : undefined,
    },
    { id: 'plugins', label: 'Acode & DexCode Plugins (Ctrl+Shift+X)', icon: <Blocks className="w-5 h-5" /> },
    { id: 'ai', label: 'DexCode Gemini AI (Ctrl+Shift+A)', icon: <Sparkles className="w-5 h-5 text-purple-400" /> },
    { id: 'terminal', label: 'Terminal Runner', icon: <Terminal className="w-5 h-5" /> },
  ];

  const getAcodeAppIcon = (iconName: string) => {
    if (iconName === 'Palette') return <Palette className="w-5 h-5 text-pink-400" />;
    if (iconName === 'Sparkles') return <Sparkles className="w-5 h-5 text-amber-400" />;
    if (iconName === 'Terminal') return <Terminal className="w-5 h-5 text-emerald-400" />;
    if (iconName === 'BarChart3') return <BarChart3 className="w-5 h-5 text-sky-400" />;
    if (iconName === 'Globe') return <Globe className="w-5 h-5 text-teal-400" />;
    return <Layers className="w-5 h-5 text-indigo-400" />;
  };

  return (
    <aside
      className="flex flex-col justify-between w-12 border-r select-none py-2 shrink-0 z-10 transition-colors"
      style={{
        backgroundColor: theme.colors.sidebarBackground,
        borderColor: theme.colors.border,
      }}
    >
      {/* Top Navigation Group */}
      <div className="flex flex-col items-center gap-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`relative p-2.5 rounded-lg transition-all cursor-pointer group ${
                isActive
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 shadow-lg'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
              title={item.label}
            >
              {item.icon}
              {item.badge !== undefined && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-black">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Dynamic Acode Sidebar Apps */}
        {acodeApps.length > 0 && (
          <div className="w-6 border-t border-gray-800 my-1 pt-1 flex flex-col items-center gap-2">
            {acodeApps.map((app) => {
              const isActive = activeTab === app.id;
              return (
                <button
                  key={app.id}
                  onClick={() => onTabChange(app.id)}
                  className={`relative p-2.5 rounded-lg transition-all cursor-pointer group ${
                    isActive
                      ? 'bg-sky-500/25 text-sky-300 border border-sky-500/40 shadow-lg ring-1 ring-sky-500/50'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }`}
                  title={`Acode App: ${app.title}`}
                >
                  {getAcodeAppIcon(app.icon)}
                  <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Settings Group */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={() => onTabChange('settings')}
          className={`p-2.5 rounded-lg transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
              : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
          }`}
          title="DexCode Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
};

