import React from 'react';
import { Settings, Palette, Type, Code, Eye, Save, Monitor } from 'lucide-react';
import { DexCodeSettings, DexCodeTheme } from '../../types';
import { BUILTIN_THEMES } from '../../services/themeManager';

interface SettingsPanelProps {
  theme: DexCodeTheme;
  settings: DexCodeSettings;
  onUpdateSettings: (newSettings: Partial<DexCodeSettings>) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  theme,
  settings,
  onUpdateSettings,
}) => {
  return (
    <div className="flex flex-col h-full text-xs select-none">
      {/* Header */}
      <div
        className="px-3 py-2 border-b font-bold tracking-wider text-[11px] uppercase flex items-center justify-between"
        style={{ borderColor: theme.colors.border, color: theme.colors.textSecondary }}
      >
        <span className="flex items-center gap-1.5">
          <Settings className="w-3.5 h-3.5 text-sky-400" /> DexCode Preferences
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Color Theme Selector */}
        <div className="space-y-1.5">
          <label className="font-bold text-gray-200 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-amber-400" /> Color Theme
          </label>
          <select
            value={settings.themeId}
            onChange={(e) => onUpdateSettings({ themeId: e.target.value })}
            className="w-full bg-black/40 border border-gray-700 rounded p-1.5 text-xs text-sky-300 font-medium outline-none focus:border-sky-500"
          >
            {BUILTIN_THEMES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.type})
              </option>
            ))}
          </select>
        </div>

        {/* Font Size */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="font-bold text-gray-200 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-sky-400" /> Font Size ({settings.fontSize}px)
            </label>
          </div>
          <input
            type="range"
            min={10}
            max={24}
            value={settings.fontSize}
            onChange={(e) => onUpdateSettings({ fontSize: Number(e.target.value) })}
            className="w-full accent-sky-500 cursor-pointer"
          />
        </div>

        {/* Font Family */}
        <div className="space-y-1.5">
          <label className="font-bold text-gray-200 flex items-center gap-1.5">
            <Code className="w-3.5 h-3.5 text-purple-400" /> Font Family
          </label>
          <select
            value={settings.fontFamily}
            onChange={(e) => onUpdateSettings({ fontFamily: e.target.value })}
            className="w-full bg-black/40 border border-gray-700 rounded p-1.5 text-xs text-gray-200 font-mono outline-none focus:border-sky-500"
          >
            <option value="'Fira Code', 'JetBrains Mono', 'Consolas', monospace">Fira Code / JetBrains Mono</option>
            <option value="'Consolas', 'Courier New', monospace">Consolas</option>
            <option value="'Source Code Pro', monospace">Source Code Pro</option>
            <option value="monospace">System Monospace</option>
          </select>
        </div>

        {/* Tab Size */}
        <div className="space-y-1.5">
          <label className="font-bold text-gray-200">Tab Size (Spaces)</label>
          <div className="flex gap-2">
            {[2, 4, 8].map((size) => (
              <button
                key={size}
                onClick={() => onUpdateSettings({ tabSize: size })}
                className={`flex-1 py-1 rounded font-bold transition-colors cursor-pointer ${
                  settings.tabSize === size
                    ? 'bg-sky-600 text-white'
                    : 'bg-black/30 border border-gray-700 text-gray-400 hover:text-white'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Word Wrap Toggle */}
        <div className="flex items-center justify-between py-1 border-t border-gray-800">
          <span className="font-bold text-gray-200 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-emerald-400" /> Word Wrap
          </span>
          <button
            onClick={() => onUpdateSettings({ wordWrap: settings.wordWrap === 'on' ? 'off' : 'on' })}
            className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer ${
              settings.wordWrap === 'on' ? 'bg-emerald-500 text-black' : 'bg-gray-700 text-gray-300'
            }`}
          >
            {settings.wordWrap}
          </button>
        </div>

        {/* Minimap Toggle */}
        <div className="flex items-center justify-between py-1 border-t border-gray-800">
          <span className="font-bold text-gray-200">Editor Minimap</span>
          <button
            onClick={() => onUpdateSettings({ minimap: !settings.minimap })}
            className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer ${
              settings.minimap ? 'bg-sky-500 text-black' : 'bg-gray-700 text-gray-300'
            }`}
          >
            {settings.minimap ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        {/* Auto Save Toggle */}
        <div className="space-y-1.5 pt-2 border-t border-gray-800">
          <label className="font-bold text-gray-200 flex items-center gap-1.5">
            <Save className="w-3.5 h-3.5 text-sky-400" /> Auto Save Mode
          </label>
          <select
            value={settings.autoSave}
            onChange={(e) => onUpdateSettings({ autoSave: e.target.value as any })}
            className="w-full bg-black/40 border border-gray-700 rounded p-1.5 text-xs text-gray-200 outline-none focus:border-sky-500"
          >
            <option value="afterDelay">After Delay (2s)</option>
            <option value="onFocusChange">On Focus Change</option>
            <option value="off">Off (Manual Ctrl+S)</option>
          </select>
        </div>

        {/* Desktop Native Mode */}
        <div className="flex items-center justify-between py-2 border-t border-gray-800">
          <div>
            <div className="font-bold text-gray-200 flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-sky-400" /> Desktop Native IPC
            </div>
            <div className="text-[10px] text-gray-400">Direct Electron file access</div>
          </div>
          <button
            onClick={() => onUpdateSettings({ desktopNativeMode: !settings.desktopNativeMode })}
            className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer ${
              settings.desktopNativeMode ? 'bg-sky-500 text-black' : 'bg-gray-700 text-gray-300'
            }`}
          >
            {settings.desktopNativeMode ? 'Active' : 'Off'}
          </button>
        </div>
      </div>
    </div>
  );
};
