import React from 'react';
import { X, Pin, FileCode, FileText, FileJson, Plus } from 'lucide-react';
import { TabItem, DexCodeTheme } from '../../types';

interface TabBarProps {
  theme: DexCodeTheme;
  tabs: TabItem[];
  activeTabId: string | null;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onNewTab: () => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  theme,
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
}) => {
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'json') return <FileJson className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
    if (['ts', 'tsx', 'js', 'jsx'].includes(ext || ''))
      return <FileCode className="w-3.5 h-3.5 text-sky-400 shrink-0" />;
    return <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0" />;
  };

  return (
    <div
      className="flex items-center justify-between h-9 border-b select-none overflow-x-auto scrollbar-none"
      style={{
        backgroundColor: theme.colors.inactiveTabBackground,
        borderColor: theme.colors.border,
      }}
    >
      {/* Tabs scroll list */}
      <div className="flex items-center overflow-x-auto scrollbar-none flex-1">
        {tabs.map((tab, idx) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id ? `tab-${tab.id}` : `tab-idx-${idx}`}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2 px-3 h-9 border-r border-t-2 text-xs cursor-pointer group shrink-0 transition-colors ${
                isActive
                  ? 'border-t-sky-400 font-semibold'
                  : 'border-t-transparent text-gray-400 hover:text-gray-200'
              }`}
              style={{
                backgroundColor: isActive
                  ? theme.colors.activeTabBackground
                  : theme.colors.inactiveTabBackground,
                color: isActive ? theme.colors.textPrimary : theme.colors.textSecondary,
                borderColor: theme.colors.border,
              }}
            >
              {getFileIcon(tab.name)}
              <span className="truncate max-w-[140px]">{tab.name}</span>

              {/* Dirty Indicator or Close Button */}
              {tab.isDirty ? (
                <span className="w-2 h-2 rounded-full bg-sky-400 group-hover:hidden" title="Unsaved changes" />
              ) : null}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(tab.id);
                }}
                className={`p-0.5 rounded hover:bg-white/20 text-gray-400 hover:text-white transition-colors ${
                  tab.isDirty ? 'hidden group-hover:block' : 'opacity-0 group-hover:opacity-100'
                }`}
                title="Close Tab"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>

      {/* New tab button */}
      <button
        onClick={onNewTab}
        className="px-3 h-9 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer shrink-0 border-l border-gray-800"
        title="New Untitled Tab"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};
