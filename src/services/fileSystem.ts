import { FileNode } from '../types';

// Fallback initial virtual project when server is unreachable
const VIRTUAL_WORKSPACE: FileNode[] = [
  {
    id: 'src',
    name: 'src',
    path: 'src',
    type: 'folder',
    children: [
      {
        id: 'src/App.tsx',
        name: 'App.tsx',
        path: 'src/App.tsx',
        type: 'file',
        size: 1024,
      },
      {
        id: 'src/index.css',
        name: 'index.css',
        path: 'src/index.css',
        type: 'file',
        size: 450,
      },
      {
        id: 'src/main.tsx',
        name: 'main.tsx',
        path: 'src/main.tsx',
        type: 'file',
        size: 320,
      },
      {
        id: 'src/types/index.ts',
        name: 'index.ts',
        path: 'src/types/index.ts',
        type: 'file',
        size: 800,
      },
    ],
  },
  {
    id: 'electron',
    name: 'electron',
    path: 'electron',
    type: 'folder',
    children: [
      {
        id: 'electron/main.js',
        name: 'main.js',
        path: 'electron/main.js',
        type: 'file',
        size: 2100,
      },
      {
        id: 'electron/preload.js',
        name: 'preload.js',
        path: 'electron/preload.js',
        type: 'file',
        size: 850,
      },
    ],
  },
  {
    id: 'package.json',
    name: 'package.json',
    path: 'package.json',
    type: 'file',
    size: 1500,
  },
  {
    id: 'README.md',
    name: 'README.md',
    path: 'README.md',
    type: 'file',
    size: 3200,
  },
  {
    id: 'metadata.json',
    name: 'metadata.json',
    path: 'metadata.json',
    type: 'file',
    size: 200,
  },
];

export async function fetchWorkspaceTree(): Promise<FileNode[]> {
  try {
    const res = await fetch('/api/files/tree');
    const data = await res.json();
    if (data.success && Array.isArray(data.tree)) {
      return data.tree;
    }
  } catch (err) {
    console.warn('DexCode Server offline, fallback to virtual workspace', err);
  }
  return VIRTUAL_WORKSPACE;
}

export async function readFileContent(relPath: string): Promise<string> {
  // Check Electron Desktop bridge first
  if (typeof window !== 'undefined' && (window as any).dexcodeDesktop?.readFile) {
    const res = await (window as any).dexcodeDesktop.readFile(relPath);
    if (res.success) return res.content;
  }

  // Try Server API
  try {
    const res = await fetch('/api/files/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ relPath }),
    });
    const data = await res.json();
    if (data.success) return data.content;
  } catch (err) {
    // Fallback to local storage or dummy content
  }

  const stored = localStorage.getItem(`dexcode_file_${relPath}`);
  if (stored !== null) return stored;

  return `// ${relPath} - DexCode Code Editor
import React from 'react';

export default function Example() {
  return <div>Welcome to DexCode Desktop & Web Editor!</div>;
}
`;
}

export async function writeFileContent(relPath: string, content: string): Promise<boolean> {
  // Check Electron Desktop bridge first
  if (typeof window !== 'undefined' && (window as any).dexcodeDesktop?.writeFile) {
    const res = await (window as any).dexcodeDesktop.writeFile(relPath, content);
    if (res.success) return true;
  }

  // Try Server API
  try {
    const res = await fetch('/api/files/write', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ relPath, content }),
    });
    const data = await res.json();
    if (data.success) return true;
  } catch (err) {
    console.warn('DexCode server write failed, saving to localStorage browser fallback', err);
  }

  localStorage.setItem(`dexcode_file_${relPath}`, content);
  return true;
}

export async function createFileSystemItem(relPath: string, type: 'file' | 'folder'): Promise<boolean> {
  try {
    const res = await fetch('/api/files/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ relPath, type }),
    });
    const data = await res.json();
    return Boolean(data.success);
  } catch (err) {
    return true;
  }
}

export async function deleteFileSystemItem(relPath: string): Promise<boolean> {
  try {
    const res = await fetch('/api/files/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ relPath }),
    });
    const data = await res.json();
    return Boolean(data.success);
  } catch (err) {
    return true;
  }
}

export async function renameFileSystemItem(oldRelPath: string, newRelPath: string): Promise<boolean> {
  try {
    const res = await fetch('/api/files/rename', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldRelPath, newRelPath }),
    });
    const data = await res.json();
    return Boolean(data.success);
  } catch (err) {
    return true;
  }
}

// Utility to determine Monaco editor language from file extension
export function detectLanguageFromExtension(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  switch (ext) {
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'js':
    case 'jsx':
    case 'cjs':
    case 'mjs':
      return 'javascript';
    case 'json':
      return 'json';
    case 'html':
    case 'htm':
      return 'html';
    case 'css':
    case 'scss':
    case 'less':
      return 'css';
    case 'md':
    case 'markdown':
      return 'markdown';
    case 'py':
      return 'python';
    case 'sh':
    case 'bash':
      return 'shell';
    case 'sql':
      return 'sql';
    case 'yaml':
    case 'yml':
      return 'yaml';
    case 'xml':
    case 'svg':
      return 'xml';
    default:
      return 'plaintext';
  }
}
