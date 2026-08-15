import React, { useState } from 'react';
import {
  GitBranch,
  GitCommit,
  Plus,
  Minus,
  Check,
  RefreshCw,
  FileCode,
  History,
  ArrowUpRight,
} from 'lucide-react';
import { DexCodeTheme, GitFileStatus } from '../../types';
import { INITIAL_GIT_STATUSES, INITIAL_GIT_BRANCHES, INITIAL_GIT_HISTORY } from '../../services/gitService';

interface GitPanelProps {
  theme: DexCodeTheme;
  gitBranch: string;
  onChangeBranch: (branch: string) => void;
  onOpenDiff: (filePath: string) => void;
}

export const GitPanel: React.FC<GitPanelProps> = ({
  theme,
  gitBranch,
  onChangeBranch,
  onOpenDiff,
}) => {
  const [statuses, setStatuses] = useState<GitFileStatus[]>(INITIAL_GIT_STATUSES);
  const [stagedPaths, setStagedPaths] = useState<string[]>(['electron/main.js']);
  const [commitMessage, setCommitMessage] = useState('');
  const [branches] = useState<string[]>(INITIAL_GIT_BRANCHES);
  const [history, setHistory] = useState(INITIAL_GIT_HISTORY);

  const unstagedFiles = statuses.filter((s) => !stagedPaths.includes(s.path));
  const stagedFiles = statuses.filter((s) => stagedPaths.includes(s.path));

  const handleStage = (path: string) => {
    setStagedPaths((prev) => [...prev, path]);
  };

  const handleUnstage = (path: string) => {
    setStagedPaths((prev) => prev.filter((p) => p !== path));
  };

  const handleStageAll = () => {
    setStagedPaths(statuses.map((s) => s.path));
  };

  const handleUnstageAll = () => {
    setStagedPaths([]);
  };

  const handleCommit = () => {
    if (!commitMessage.trim() || stagedFiles.length === 0) return;

    const newCommit = {
      hash: Math.random().toString(16).substring(2, 9),
      message: commitMessage.trim(),
      author: 'DexCode Lead <dev@dexcode.io>',
      timestamp: 'Just now',
    };

    setHistory([newCommit, ...history]);
    setStatuses(statuses.filter((s) => !stagedPaths.includes(s.path)));
    setStagedPaths([]);
    setCommitMessage('');
  };

  return (
    <div className="flex flex-col h-full text-xs select-none">
      {/* Header */}
      <div
        className="px-3 py-2 border-b font-bold tracking-wider text-[11px] uppercase flex items-center justify-between"
        style={{ borderColor: theme.colors.border, color: theme.colors.textSecondary }}
      >
        <span className="flex items-center gap-1.5">
          <GitBranch className="w-3.5 h-3.5 text-sky-400" /> Source Control
        </span>

        {/* Branch Switcher Selector */}
        <select
          value={gitBranch}
          onChange={(e) => onChangeBranch(e.target.value)}
          className="bg-black/40 border border-gray-700 rounded px-2 py-0.5 text-xs text-sky-300 font-semibold outline-none"
        >
          {branches.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      {/* Commit Input Box */}
      <div className="p-3 border-b space-y-2" style={{ borderColor: theme.colors.border }}>
        <textarea
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          placeholder="Message (Ctrl+Enter to commit)..."
          rows={2}
          className="w-full bg-black/40 border border-gray-700 rounded p-2 text-xs text-white outline-none focus:border-sky-500 resize-none"
        />
        <button
          onClick={handleCommit}
          disabled={!commitMessage.trim() || stagedFiles.length === 0}
          className="w-full py-1.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white rounded font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <GitCommit className="w-3.5 h-3.5" /> Commit ({stagedFiles.length})
        </button>
      </div>

      {/* Changes list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {/* Staged Section */}
        <div>
          <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase mb-1">
            <span>Staged Changes ({stagedFiles.length})</span>
            {stagedFiles.length > 0 && (
              <button onClick={handleUnstageAll} className="hover:text-white">
                Unstage All
              </button>
            )}
          </div>
          {stagedFiles.map((file) => (
            <div
              key={file.path}
              onClick={() => onOpenDiff(file.path)}
              className="flex items-center justify-between p-1.5 rounded hover:bg-white/5 cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 text-gray-200 truncate">
                <FileCode className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{file.path}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUnstage(file.path);
                }}
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-white text-gray-400"
                title="Unstage"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Unstaged Section */}
        <div>
          <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase mb-1">
            <span>Changes ({unstagedFiles.length})</span>
            {unstagedFiles.length > 0 && (
              <button onClick={handleStageAll} className="hover:text-white">
                Stage All
              </button>
            )}
          </div>
          {unstagedFiles.map((file) => (
            <div
              key={file.path}
              onClick={() => onOpenDiff(file.path)}
              className="flex items-center justify-between p-1.5 rounded hover:bg-white/5 cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 text-gray-200 truncate">
                <FileCode className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">{file.path}</span>
                <span className="text-[9px] uppercase px-1 rounded bg-amber-500/20 text-amber-300 font-mono">
                  {file.status}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStage(file.path);
                }}
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-white text-gray-400"
                title="Stage"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* History Log */}
        <div className="pt-2 border-t" style={{ borderColor: theme.colors.border }}>
          <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase mb-2">
            <History className="w-3 h-3 text-sky-400" /> Recent Commit Graph
          </div>
          <div className="space-y-1.5">
            {history.map((c) => (
              <div key={c.hash} className="p-2 rounded bg-black/30 border border-gray-800 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-sky-400 font-mono font-bold">
                  <span>#{c.hash}</span>
                  <span className="text-gray-500">{c.timestamp}</span>
                </div>
                <div className="text-gray-200 text-xs font-medium truncate">{c.message}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
