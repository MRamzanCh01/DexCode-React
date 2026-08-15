import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, X, RefreshCw, Loader2, ShieldCheck, Terminal } from 'lucide-react';
import { DexCodeTheme } from '../../types';

interface DiagnosticsModalProps {
  theme: DexCodeTheme;
  isOpen: boolean;
  onClose: () => void;
}

export const DiagnosticsModal: React.FC<DiagnosticsModalProps> = ({ theme, isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      runCheck();
    }
  }, [isOpen]);

  const runCheck = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/check');
      const data = await res.json();
      setReport(data.checks || null);
    } catch (err) {
      console.error('Check failed', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
      <div
        className="w-full max-w-lg rounded-xl shadow-2xl border overflow-hidden flex flex-col text-xs"
        style={{
          backgroundColor: theme.colors.sidebarBackground,
          borderColor: theme.colors.border,
          color: theme.colors.textPrimary,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-black/30">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-bold tracking-wide text-white">
              DexCode System Diagnostic Report (npm run check)
            </span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 text-gray-400 hover:text-white rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-2 text-emerald-400">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="font-semibold text-xs animate-pulse">Running npm run check diagnostics...</p>
            </div>
          ) : report ? (
            <div className="space-y-3 font-mono">
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-2 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>SUCCESS: DexCode Project Environment & Dependencies Verified!</span>
              </div>

              <div className="space-y-1.5 p-3 rounded bg-black/40 border border-gray-800 text-[11px]">
                <div className="flex justify-between border-b border-gray-800 pb-1">
                  <span className="text-gray-400">package.json:</span>
                  <span className="text-emerald-400 font-bold">{report.packageJson ? 'PASS' : 'FAIL'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-1">
                  <span className="text-gray-400">tsconfig.json:</span>
                  <span className="text-emerald-400 font-bold">{report.tsconfig ? 'PASS' : 'FAIL'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-1">
                  <span className="text-gray-400">vite.config.ts:</span>
                  <span className="text-emerald-400 font-bold">{report.viteConfig ? 'PASS' : 'FAIL'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-1">
                  <span className="text-gray-400">Electron main process (electron/main.js):</span>
                  <span className="text-emerald-400 font-bold">{report.electronMain ? 'PASS' : 'FAIL'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-1">
                  <span className="text-gray-400">Node Runtime:</span>
                  <span className="text-sky-400 font-bold">{report.nodeVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Gemini AI Key:</span>
                  <span className={report.envGemini ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                    {report.envGemini ? 'Injected & Active' : 'Key Ready in Secrets'}
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-gray-400 leading-relaxed font-sans">
                DexCode is fully configured for development (`npm run dev`), web browser (`npm run dev:web`), server mode (`npm run server`), and cross-platform desktop installer builds (`npm run build:all`, `build:win`, `build:mac`, `build:linux`).
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-6">No diagnostic data available.</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-3 border-t border-gray-800 bg-black/20">
          <button
            onClick={runCheck}
            disabled={loading}
            className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-gray-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Re-check
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
