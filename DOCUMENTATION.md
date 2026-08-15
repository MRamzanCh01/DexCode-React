# DexCode Technical Architecture & Developer Guide

## Architecture Overview

DexCode is designed as a hybrid **Electron Desktop + Web Cloud IDE** framework.

```
[ Electron Main Process ] (electron/main.js)
         │  ▲
   IPC Bridge (electron/preload.js)
         ▼  │
[ React 19 Frontend App ] ──(REST API)──► [ Node.js / Express Server ] (server.ts)
  - Monaco Editor                           - Filesystem Tree & CRUD API
  - Sidebar Panels                          - Integrated Terminal Process Engine
  - AI Assistant                            - Extension Marketplace API
  - Plugin Engine                           - Gemini 2.5 AI Endpoint
```

---

## 1. File System Abstraction Layer (`src/services/fileSystem.ts`)

DexCode dynamically detects its runtime environment and routes file system requests through the appropriate driver:
1. **Desktop Native (Electron IPC)**: Uses `window.dexcodeDesktop` IPC calls for true OS filesystem read/write and folder picking.
2. **Web Server API**: Communicates with `/api/files`, `/api/file`, `/api/file/content` REST endpoints served by `server.ts`.
3. **Local Storage Fallback**: Used when offline or running in standalone client-only web previews.

---

## 2. Server REST APIs (`server.ts`)

- `GET /api/files` — Recursively scans workspace folder and returns structured `FileNode[]`.
- `GET /api/file?path=...` — Returns raw UTF-8 content of specified file.
- `POST /api/file` — Writes UTF-8 content to disk.
- `POST /api/file/crud` — Handles item creation (`file` / `folder`), renaming, and deletion.
- `POST /api/terminal` — Executes bash/shell commands in server process and streams standard output.
- `GET /api/check` — Runs system diagnostics checks (`package.json`, `tsconfig.json`, `vite.config.ts`, Electron entry, Node version, Gemini key).
- `GET /api/plugins` — Returns plugin marketplace extensions registry.
- `POST /api/ai/chat` — Connects to `@google/genai` with Gemini 2.5 Flash model for AI code assist.

---

## 3. Desktop Electron Configuration (`electron/main.js` & `electron/preload.js`)

- Configures native macOS, Windows, and Linux window controls, menu bars, keyboard shortcuts, and file picker dialogs.
- Supports cross-platform packaging via `electron-builder`:
  - **Windows**: NSIS installer (`.exe`)
  - **macOS**: Apple Disk Image (`.dmg`)
  - **Linux**: AppImage (`.AppImage`), Debian package (`.deb`), RedHat package (`.rpm`), Arch Linux package (`.tar.gz`).

---

## 4. Diagnostics Execution (`npm run check`)

Executing `npm run check` runs `scripts/check.js`, which verifies:
- Presence and syntax of `package.json` with `dexcode` name.
- Presence of TypeScript compiler config (`tsconfig.json`).
- Presence of Vite build configuration (`vite.config.ts`).
- Presence of Electron desktop entry point (`electron/main.js`).
- Active Node.js runtime version.
- Status of Gemini AI key in environment variables.

---

## 5. Extensibility & Plugins (`src/services/pluginSystem.ts`)

DexCode features a plugin engine supporting extension installation from an online registry:
- **Prettier Code Formatter**: Auto-formats JS/TS/JSON/CSS files on save.
- **ESLint Code Quality**: Real-time syntax and style linting.
- **GitLens Workspace Visualizer**: Enhanced visual blame and commit graph.
- **Docker & Container Tools**: Dockerfile syntax highlighting and container management.
- **Tailwind CSS IntelliSense**: Class name auto-suggestions in HTML/JSX.

---

© 2026 DexCode Core Team.
