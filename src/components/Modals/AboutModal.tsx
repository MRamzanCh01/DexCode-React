import React from 'react';
import { Code2, X, Monitor, ShieldCheck, Terminal, Cpu, HardDrive } from 'lucide-react';
import { DexCodeTheme } from '../../types';

interface AboutModalProps {
  theme: DexCodeTheme;
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ theme, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden flex flex-col text-xs"
        style={{
          backgroundColor: theme.colors.sidebarBackground,
          borderColor: theme.colors.border,
          color: theme.colors.textPrimary,
        }}
      >
        {/* Banner */}
        <div className="p-6 bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
              <Code2 className="w-8 h-8 text-sky-300" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-wide">DexCode</h2>
              <p className="text-xs text-sky-200">Cross-Platform Desktop & Web Code Editor</p>
            </div>
          </div>
        </div>

        {/* Info list */}
        <div className="p-5 space-y-3 font-sans">
          <div className="p-3 rounded-xl bg-black/30 border border-gray-800 space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-gray-400">Version:</span>
              <span className="text-sky-400 font-bold font-mono">1.0.0 (DexCode Rebrand)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Engine:</span>
              <span className="text-gray-200 font-bold font-mono">Electron + React 19 + Monaco Editor</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Supported OS:</span>
              <span className="text-gray-200 font-bold font-mono">Windows (.exe), macOS (.dmg), Linux (.AppImage/deb)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">AI Engine:</span>
              <span className="text-purple-400 font-bold font-mono">Gemini 2.5 Flash</span>
            </div>
          </div>

          <p className="text-gray-300 leading-relaxed text-[11px]">
            DexCode transforms the mobile Acode experience into a high-performance, cross-platform desktop editor with native file system access, multi-tab support, terminal shell, extension marketplace, and Git version control.
          </p>

          <div className="flex items-center justify-between text-[10px] text-gray-500 pt-2 border-t border-gray-800">
            <span>© 2026 DexCode Core Team</span>
            <span className="text-sky-400 font-semibold">https://dexcode.io</span>
          </div>
        </div>
      </div>
    </div>
  );
};
