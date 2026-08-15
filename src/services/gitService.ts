import { GitFileStatus } from '../types';

export interface GitCommit {
  hash: string;
  message: string;
  author: string;
  timestamp: string;
}

export const INITIAL_GIT_STATUSES: GitFileStatus[] = [
  { path: 'src/App.tsx', status: 'modified' },
  { path: 'electron/main.js', status: 'added' },
  { path: 'README.md', status: 'modified' },
  { path: 'DOCUMENTATION.md', status: 'untracked' },
];

export const INITIAL_GIT_BRANCHES = ['main', 'feature/dexcode-rebrand', 'release/v1.0.0', 'desktop-electron'];

export const INITIAL_GIT_HISTORY: GitCommit[] = [
  {
    hash: 'a7b93f1',
    message: 'feat: rebrand Acode to DexCode cross-platform desktop editor',
    author: 'DexCode Lead <dev@dexcode.io>',
    timestamp: '10 minutes ago',
  },
  {
    hash: 'c4e201d',
    message: 'refactor: integrate Electron IPC & native file system access',
    author: 'DexCode Lead <dev@dexcode.io>',
    timestamp: '1 hour ago',
  },
  {
    hash: '8f33b11',
    message: 'init: setup Monaco Editor & full-stack server.ts',
    author: 'DexCode Lead <dev@dexcode.io>',
    timestamp: '3 hours ago',
  },
];
