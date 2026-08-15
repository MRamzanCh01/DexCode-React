import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  FileJson,
  Plus,
  FolderPlus,
  RefreshCw,
  MoreVertical,
  Trash2,
  Edit2,
  Copy,
  ChevronRight,
  ChevronDown,
  Upload,
} from 'lucide-react';
import { FileNode, DexCodeTheme } from '../../types';

interface FileExplorerProps {
  theme: DexCodeTheme;
  files: FileNode[];
  activeFilePath?: string;
  onFileSelect: (node: FileNode) => void;
  onOpenFolder: () => void;
  onCreateFile: (parentPath: string, name: string) => void;
  onCreateFolder: (parentPath: string, name: string) => void;
  onDeleteNode: (path: string) => void;
  onRenameNode: (oldPath: string, newName: string) => void;
  onRefresh: () => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  theme,
  files,
  activeFilePath,
  onFileSelect,
  onOpenFolder,
  onCreateFile,
  onCreateFolder,
  onDeleteNode,
  onRenameNode,
  onRefresh,
}) => {
  const [expandedPaths, setExpandedPaths] = useState<Record<string, boolean>>({
    src: true,
    electron: true,
  });
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node: FileNode } | null>(null);
  const [isCreatingFile, setIsCreatingFile] = useState<string | null>(null); // parent path
  const [isCreatingFolder, setIsCreatingFolder] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const toggleExpand = (path: string) => {
    setExpandedPaths((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'json') return <FileJson className="w-4 h-4 text-amber-400 shrink-0" />;
    if (['ts', 'tsx', 'js', 'jsx', 'cjs'].includes(ext || ''))
      return <FileCode className="w-4 h-4 text-sky-400 shrink-0" />;
    return <FileText className="w-4 h-4 text-gray-400 shrink-0" />;
  };

  const handleContextMenu = (e: React.MouseEvent, node: FileNode) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, node });
  };

  const submitCreateFile = (parentPath: string) => {
    if (newItemName.trim()) {
      onCreateFile(parentPath, newItemName.trim());
      setNewItemName('');
      setIsCreatingFile(null);
    }
  };

  const submitCreateFolder = (parentPath: string) => {
    if (newItemName.trim()) {
      onCreateFolder(parentPath, newItemName.trim());
      setNewItemName('');
      setIsCreatingFolder(null);
    }
  };

  const submitRename = (oldPath: string) => {
    if (renameValue.trim() && renameValue !== oldPath) {
      onRenameNode(oldPath, renameValue.trim());
    }
    setRenamingPath(null);
  };

  const renderTree = (nodes: FileNode[], depth = 0) => {
    return nodes.map((node, index) => {
      const isExpanded = Boolean(expandedPaths[node.path]);
      const isSelected = activeFilePath === node.path;
      const nodeKey = `tree-node-${node.path || node.id || index}-${depth}`;

      if (node.type === 'folder') {
        return (
          <div key={nodeKey} className="select-none">
            <div
              onClick={() => toggleExpand(node.path)}
              onContextMenu={(e) => handleContextMenu(e, node)}
              className="flex items-center justify-between py-1 px-2 rounded cursor-pointer hover:bg-white/5 transition-colors group text-xs"
              style={{ paddingLeft: `${depth * 12 + 8}px` }}
            >
              <div className="flex items-center gap-1.5 truncate">
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                )}
                {isExpanded ? (
                  <FolderOpen className="w-4 h-4 text-sky-400 shrink-0" />
                ) : (
                  <Folder className="w-4 h-4 text-sky-400 shrink-0" />
                )}
                <span className="font-semibold text-gray-200 truncate">{node.name}</span>
              </div>

              {/* Quick Actions on Folder */}
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-gray-400">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCreatingFile(node.path);
                    setExpandedPaths((prev) => ({ ...prev, [node.path]: true }));
                  }}
                  title="New File"
                  className="hover:text-white p-0.5"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCreatingFolder(node.path);
                    setExpandedPaths((prev) => ({ ...prev, [node.path]: true }));
                  }}
                  title="New Folder"
                  className="hover:text-white p-0.5"
                >
                  <FolderPlus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Inline Create File Input */}
            {isCreatingFile === node.path && (
              <div className="flex items-center gap-1 py-1 px-2 my-0.5" style={{ paddingLeft: `${(depth + 1) * 12 + 8}px` }}>
                <FileCode className="w-3.5 h-3.5 text-sky-400" />
                <input
                  type="text"
                  autoFocus
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitCreateFile(node.path);
                    if (e.key === 'Escape') setIsCreatingFile(null);
                  }}
                  onBlur={() => submitCreateFile(node.path)}
                  placeholder="filename.ts"
                  className="bg-black/50 border border-sky-500 rounded px-1.5 py-0.5 text-xs text-white outline-none w-full"
                />
              </div>
            )}

            {/* Inline Create Folder Input */}
            {isCreatingFolder === node.path && (
              <div className="flex items-center gap-1 py-1 px-2 my-0.5" style={{ paddingLeft: `${(depth + 1) * 12 + 8}px` }}>
                <Folder className="w-3.5 h-3.5 text-sky-400" />
                <input
                  type="text"
                  autoFocus
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitCreateFolder(node.path);
                    if (e.key === 'Escape') setIsCreatingFolder(null);
                  }}
                  onBlur={() => submitCreateFolder(node.path)}
                  placeholder="foldername"
                  className="bg-black/50 border border-sky-500 rounded px-1.5 py-0.5 text-xs text-white outline-none w-full"
                />
              </div>
            )}

            {/* Render Folder Children */}
            {isExpanded && node.children && renderTree(node.children, depth + 1)}
          </div>
        );
      }

      // File Node
      return (
        <div key={node.id} className="select-none">
          {renamingPath === node.path ? (
            <div className="flex items-center gap-1 py-1 px-2 my-0.5" style={{ paddingLeft: `${depth * 12 + 20}px` }}>
              <input
                type="text"
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitRename(node.path);
                  if (e.key === 'Escape') setRenamingPath(null);
                }}
                onBlur={() => submitRename(node.path)}
                className="bg-black/50 border border-sky-500 rounded px-1.5 py-0.5 text-xs text-white outline-none w-full"
              />
            </div>
          ) : (
            <div
              onClick={() => onFileSelect(node)}
              onContextMenu={(e) => handleContextMenu(e, node)}
              className={`flex items-center gap-2 py-1 px-2 rounded cursor-pointer transition-colors text-xs ${
                isSelected ? 'bg-sky-500/20 text-sky-300 font-semibold border-l-2 border-sky-400' : 'text-gray-300 hover:bg-white/5'
              }`}
              style={{ paddingLeft: `${depth * 12 + 20}px` }}
            >
              {getFileIcon(node.name)}
              <span className="truncate">{node.name}</span>
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div
      className="flex flex-col h-full select-none text-xs"
      onClick={() => setContextMenu(null)}
    >
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b font-bold tracking-wider text-[11px] uppercase"
        style={{ borderColor: theme.colors.border, color: theme.colors.textSecondary }}
      >
        <span>Explorer</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setIsCreatingFile('');
              setNewItemName('');
            }}
            title="New File in Root"
            className="p-1 hover:text-white rounded hover:bg-white/10 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onOpenFolder}
            title="Open Folder / Workspace"
            className="p-1 hover:text-white rounded hover:bg-white/10 transition-colors"
          >
            <FolderOpen className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRefresh}
            title="Refresh Explorer"
            className="p-1 hover:text-white rounded hover:bg-white/10 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Root Inline Create File Input */}
      {isCreatingFile === '' && (
        <div className="p-2 border-b border-gray-700/50">
          <input
            type="text"
            autoFocus
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitCreateFile('');
              if (e.key === 'Escape') setIsCreatingFile(null);
            }}
            onBlur={() => submitCreateFile('')}
            placeholder="new-file.ts"
            className="bg-black/50 border border-sky-500 rounded px-2 py-1 text-xs text-white outline-none w-full"
          />
        </div>
      )}

      {/* File Tree List */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
        {renderTree(files)}
      </div>

      {/* Context Menu Modal */}
      {contextMenu && (
        <div
          className="fixed z-50 w-44 rounded-md shadow-2xl border py-1 text-xs"
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
            backgroundColor: theme.colors.sidebarBackground,
            borderColor: theme.colors.border,
            color: theme.colors.textPrimary,
          }}
        >
          <button
            onClick={() => {
              if (contextMenu.node.type === 'file') onFileSelect(contextMenu.node);
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-sky-500/20"
          >
            <FileCode className="w-3.5 h-3.5 text-sky-400" /> Open File
          </button>
          <button
            onClick={() => {
              setRenamingPath(contextMenu.node.path);
              setRenameValue(contextMenu.node.name);
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-sky-500/20"
          >
            <Edit2 className="w-3.5 h-3.5 text-amber-400" /> Rename
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(contextMenu.node.path);
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-sky-500/20"
          >
            <Copy className="w-3.5 h-3.5 text-gray-400" /> Copy Path
          </button>
          <div className="my-1 border-t border-gray-700/50" />
          <button
            onClick={() => {
              onDeleteNode(contextMenu.node.path);
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-red-500/20 text-red-400"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      )}
    </div>
  );
};
