import React, { useState, useEffect } from 'react';
import { Search, FileCode, Sparkles, Terminal, Settings, CheckCircle2, Blocks } from 'lucide-react';
import { DexCodeTheme, FileNode, AcodePaletteCommand } from '../../types';
import { acodeRuntime } from '../../services/acodeRuntime';

interface CommandPaletteModalProps {
  theme: DexCodeTheme;
  files: FileNode[];
  isOpen: boolean;
  onClose: () => void;
  onSelectFile: (path: string) => void;
  onRunCheck: () => void;
  onToggleTerminal: () => void;
  onToggleSidebar: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  theme,
  files,
  isOpen,
  onClose,
  onSelectFile,
  onRunCheck,
  onToggleTerminal,
  onToggleSidebar,
}) => {
  const [query, setQuery] = useState('');
  const [acodeCommands, setAcodeCommands] = useState<AcodePaletteCommand[]>([]);

  useEffect(() => {
    setAcodeCommands(acodeRuntime.getPaletteCommands());
    const unsub = acodeRuntime.subscribeCommands(() => {
      setAcodeCommands(acodeRuntime.getPaletteCommands());
    });
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  // Flatten file list
  const flattenFiles = (nodes: FileNode[]): FileNode[] => {
    let result: FileNode[] = [];
    nodes.forEach((n) => {
      if (n.type === 'file') result.push(n);
      if (n.children) result = result.concat(flattenFiles(n.children));
    });
    return result;
  };

  const allFiles = flattenFiles(files);
  const matchingFiles = allFiles.filter((f) =>
    f.name.toLowerCase().includes(query.toLowerCase()) || f.path.toLowerCase().includes(query.toLowerCase())
  );

  const baseCommands = [
    {
      id: 'cmd-check',
      label: 'System Check: Run Diagnostic Check (npm run check)',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
      action: () => {
        onRunCheck();
        onClose();
      },
    },
    {
      id: 'cmd-terminal',
      label: 'View: Toggle Integrated Terminal',
      icon: <Terminal className="w-4 h-4 text-sky-400" />,
      action: () => {
        onToggleTerminal();
        onClose();
      },
    },
    {
      id: 'cmd-sidebar',
      label: 'View: Toggle Primary Sidebar',
      icon: <Settings className="w-4 h-4 text-purple-400" />,
      action: () => {
        onToggleSidebar();
        onClose();
      },
    },
  ];

  const matchingBaseCommands = baseCommands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  const matchingAcodeCommands = acodeCommands.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-xs select-none">
      <div
        className="w-full max-w-xl rounded-xl shadow-2xl border overflow-hidden flex flex-col text-xs"
        style={{
          backgroundColor: theme.colors.sidebarBackground,
          borderColor: theme.colors.border,
          color: theme.colors.textPrimary,
        }}
      >
        {/* Input box */}
        <div className="flex items-center px-4 py-3 border-b border-gray-700/50">
          <Search className="w-4 h-4 text-sky-400 mr-2 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
            }}
            placeholder="Type a file name, Acode command, or system action..."
            className="w-full bg-transparent border-none text-sm text-white outline-none"
          />
          <span className="text-[10px] text-gray-500 font-mono px-1.5 py-0.5 rounded bg-black/40">ESC to cancel</span>
        </div>

        {/* Command & File matches list */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {/* Acode Plugin Commands */}
          {matchingAcodeCommands.length > 0 && (
            <>
              <div className="text-[10px] text-sky-400 font-bold uppercase px-2 py-1 flex items-center gap-1">
                <Blocks className="w-3 h-3" /> Acode Plugin Commands ({matchingAcodeCommands.length})
              </div>
              {matchingAcodeCommands.map((cmd) => (
                <div
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    onClose();
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-400" />
                    <span className="font-semibold text-gray-100">{cmd.title}</span>
                  </div>
                  <span className="text-[9px] text-sky-400 font-mono px-1 rounded bg-sky-500/20">Acode</span>
                </div>
              ))}
            </>
          )}

          {/* Quick System Commands */}
          <div className="text-[10px] text-gray-400 font-bold uppercase px-2 py-1 pt-2">System Commands</div>
          {matchingBaseCommands.map((cmd) => (
            <div
              key={cmd.id}
              onClick={cmd.action}
              className="flex items-center gap-2 px-3 py-2 rounded hover:bg-sky-500/20 cursor-pointer transition-colors"
            >
              {cmd.icon}
              <span className="font-semibold text-gray-200">{cmd.label}</span>
            </div>
          ))}

          {/* Matching Files */}
          <div className="text-[10px] text-gray-400 font-bold uppercase px-2 py-1 pt-2">
            Matching Files ({matchingFiles.length})
          </div>
          {matchingFiles.map((file) => (
            <div
              key={file.id}
              onClick={() => {
                onSelectFile(file.path);
                onClose();
              }}
              className="flex items-center justify-between px-3 py-2 rounded hover:bg-sky-500/20 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="font-semibold text-gray-200">{file.name}</span>
              </div>
              <span className="text-[10px] text-gray-500 font-mono">{file.path}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

