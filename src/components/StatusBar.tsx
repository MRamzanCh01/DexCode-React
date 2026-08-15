import React from 'react';
import { GitBranch, Terminal, Sparkles, Check, AlertCircle, RefreshCw, Bell } from 'lucide-react';
import { DexCodeTheme } from '../types';

interface StatusBarProps {
  theme: DexCodeTheme;
  gitBranch: string;
  modifiedCount: number;
  untrackedCount: number;
  cursorLine: number;
  cursorCol: number;
  language: string;
  tabSize: number;
  isTerminalOpen: boolean;
  onToggleTerminal: () => void;
  statusMessage?: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  theme,
  gitBranch,
  modifiedCount,
  untrackedCount,
  cursorLine,
  cursorCol,
  language,
  tabSize,
  isTerminalOpen,
  onToggleTerminal,
  statusMessage = 'DexCode Ready',
}) => {
  return (
    <footer
      className="flex items-center justify-between h-6 px-2 text-[11px] select-none border-t transition-colors font-mono"
      style={{
        backgroundColor: theme.colors.statusBarBackground,
        borderColor: theme.colors.border,
        color: theme.colors.textSecondary,
      }}
    >
      {/* Left side */}
      <div className="flex items-center gap-3">
        {/* Git Branch Badge */}
        <div className="flex items-center gap-1 hover:text-sky-400 cursor-pointer transition-colors" title="Git Branch">
          <GitBranch className="w-3 h-3 text-sky-400" />
          <span className="font-semibold text-gray-200">{gitBranch}</span>
          {(modifiedCount > 0 || untrackedCount > 0) && (
            <span className="ml-1 text-[10px] text-amber-400 font-bold">
              *{modifiedCount + untrackedCount}
            </span>
          )}
        </div>

        {/* Status Message */}
        <div className="flex items-center gap-1.5 text-gray-400">
          <Check className="w-3 h-3 text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Cursor position */}
        <div className="hidden sm:inline-block text-gray-300">
          Ln {cursorLine}, Col {cursorCol}
        </div>

        {/* Spaces */}
        <div className="hidden sm:inline-block">Spaces: {tabSize}</div>

        {/* Encoding */}
        <div className="hidden md:inline-block">UTF-8</div>

        {/* Active Language */}
        <div className="px-1.5 py-0.5 rounded bg-white/5 text-sky-300 font-semibold uppercase text-[10px]">
          {language}
        </div>

        {/* DexCode Gemini AI Indicator */}
        <div className="flex items-center gap-1 text-purple-400 font-medium" title="DexCode AI Assistant Active">
          <Sparkles className="w-3 h-3 text-purple-400 animate-pulse" />
          <span className="hidden md:inline text-[10px]">Gemini 2.5 AI</span>
        </div>

        {/* Terminal Toggle Button */}
        <button
          onClick={onToggleTerminal}
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
            isTerminalOpen ? 'bg-sky-500/20 text-sky-300' : 'hover:bg-white/10 text-gray-400'
          }`}
          title="Toggle Integrated Terminal (Ctrl+`)"
        >
          <Terminal className="w-3 h-3" />
          <span>Terminal</span>
        </button>

        {/* Bell */}
        <div className="hover:text-white cursor-pointer transition-colors">
          <Bell className="w-3 h-3 text-gray-400" />
        </div>
      </div>
    </footer>
  );
};
