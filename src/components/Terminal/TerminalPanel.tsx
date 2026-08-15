import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, X, Trash2, Play, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import { DexCodeTheme, TerminalLog } from '../../types';

interface TerminalPanelProps {
  theme: DexCodeTheme;
  isOpen: boolean;
  onClose: () => void;
  onRunDiagnostics: () => void;
}

export const TerminalPanel: React.FC<TerminalPanelProps> = ({
  theme,
  isOpen,
  onClose,
  onRunDiagnostics,
}) => {
  const [logs, setLogs] = useState<TerminalLog[]>([
    {
      id: '1',
      type: 'info',
      text: 'DexCode Integrated Terminal Environment v1.0.0',
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: '2',
      type: 'info',
      text: 'Type commands or click quick NPM scripts below. Run "npm run check" for diagnostic verification.',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  if (!isOpen) return null;

  const executeCommand = async (cmdToRun: string) => {
    const cmd = cmdToRun.trim();
    if (!cmd) return;

    const userLog: TerminalLog = {
      id: Math.random().toString(),
      type: 'cmd',
      text: `$ ${cmd}`,
      timestamp: new Date().toLocaleTimeString(),
    };

    setLogs((prev) => [...prev, userLog]);
    setInput('');
    setLoading(true);

    if (cmd === 'clear' || cmd === 'cls') {
      setLogs([]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/terminal/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd }),
      });

      const data = await res.json();
      const outputLog: TerminalLog = {
        id: Math.random().toString(),
        type: data.success ? 'output' : 'error',
        text: data.output || (data.success ? 'Command executed successfully.' : 'Command failed.'),
        timestamp: new Date().toLocaleTimeString(),
      };

      setLogs((prev) => [...prev, outputLog]);
    } catch (err: any) {
      setLogs((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          type: 'error',
          text: `Terminal error: ${err.message}`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const npmScripts = [
    { label: 'npm run check', action: onRunDiagnostics, color: 'text-emerald-400 bg-emerald-500/10' },
    { label: 'npm run dev:web', action: () => executeCommand('npm run dev:web'), color: 'text-sky-400 bg-sky-500/10' },
    { label: 'npm run build', action: () => executeCommand('npm run build'), color: 'text-purple-400 bg-purple-500/10' },
    { label: 'npm run build:win', action: () => executeCommand('npm run build:win'), color: 'text-amber-400 bg-amber-500/10' },
    { label: 'npm run build:linux', action: () => executeCommand('npm run build:linux'), color: 'text-pink-400 bg-pink-500/10' },
    { label: 'npm run build:mac', action: () => executeCommand('npm run build:mac'), color: 'text-teal-400 bg-teal-500/10' },
  ];

  return (
    <div
      className="h-56 border-t flex flex-col font-mono text-xs select-none transition-all z-20"
      style={{
        backgroundColor: theme.colors.statusBarBackground,
        borderColor: theme.colors.border,
      }}
    >
      {/* Header Controls */}
      <div className="flex items-center justify-between px-3 h-8 border-b bg-black/30" style={{ borderColor: theme.colors.border }}>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-bold text-sky-400 text-[11px] uppercase">
            <TerminalIcon className="w-3.5 h-3.5" /> Terminal Shell
          </span>

          {/* Quick Script Launcher Pills */}
          <div className="hidden md:flex items-center gap-1 ml-2">
            {npmScripts.map((s, idx) => (
              <button
                key={idx}
                onClick={s.action}
                className={`px-2 py-0.5 rounded text-[10px] font-bold hover:brightness-125 transition-all cursor-pointer ${s.color}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setLogs([])}
            className="p-1 hover:bg-white/10 text-gray-400 hover:text-white rounded"
            title="Clear Terminal Output"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 text-gray-400 hover:text-white rounded"
            title="Close Terminal"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Output Stream */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-1 bg-black/60 font-mono text-[11px]">
        {logs.map((log) => (
          <div
            key={log.id}
            className={`whitespace-pre-wrap leading-relaxed ${
              log.type === 'cmd'
                ? 'text-sky-400 font-bold'
                : log.type === 'error'
                ? 'text-red-400'
                : log.type === 'info'
                ? 'text-purple-300'
                : 'text-gray-200'
            }`}
          >
            {log.text}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-sky-400 py-1 font-bold">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Executing command...</span>
          </div>
        )}
      </div>

      {/* Terminal Input prompt */}
      <div className="flex items-center px-3 py-1.5 bg-black/80 border-t border-gray-800">
        <ChevronRight className="w-4 h-4 text-sky-400 shrink-0" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') executeCommand(input);
          }}
          placeholder="Type shell command or npm script..."
          className="w-full bg-transparent border-none text-xs text-white outline-none pl-2 font-mono"
        />
      </div>
    </div>
  );
};
