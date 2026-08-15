# DexCode — Professional Cross-Platform Code Editor & Web IDE

**DexCode** is a high-performance, feature-rich, cross-platform desktop and web code editor rebranded and modernized from Acode. Engineered with Electron, React 19, Monaco Editor (VS Code core), Tailwind CSS, and Node.js, DexCode delivers native desktop capabilities alongside cloud web access.

---

## 🌟 Key Capabilities & Features

1. **Complete Rebrand from Acode to DexCode**:
   - Modernized UI layout, sleek high-contrast themes (Dracula, One Dark Pro, GitHub Dark/Light, Synthwave, Nord, Monokai).
   - Rebranded package manifests, desktop windows, native menu system, and branded titlebars.

2. **Native Electron Desktop App (`npm run dev:desktop`)**:
   - Cross-platform builds for **Windows (`.exe`)**, **macOS (`.dmg`)**, and **Linux (`.AppImage`, `.deb`, `.rpm`)**.
   - Direct access to local filesystem via native IPC bridge (`window.dexcodeDesktop`).
   - Native OS dialogs for opening workspace folders and saving files.

3. **Web Mode & Server Backend (`npm run dev:web` / `npm run server`)**:
   - Express backend on port 3000 providing full REST API for filesystem tree, file reading/writing, and terminal command execution.
   - Fallback local browser storage for offline standalone web mode.

4. **Diagnostic Verification Tool (`npm run check`)**:
   - Run `npm run check` in terminal or click **Run System Diagnostics** from the top menu/command palette to verify project environment, dependencies (`package.json`, `tsconfig.json`, `vite.config.ts`), Electron main process, Node runtime, and Gemini AI key status.

5. **Integrated Monaco Code Editor**:
   - Full IntelliSense autocompletion, syntax highlighting for 30+ languages, code folding, minimap, line numbers, error diagnostics, and keybindings.
   - Multi-tab editor with dirty file indicators and tab closing.
   - Built-in visual Git Diff viewer comparing current edits against original repository state.

6. **Gemini 2.5 AI Coding Assistant**:
   - Explain code blocks, refactor for performance, auto-fix errors, generate unit tests, or run custom natural language prompts with direct single-click insertion into the editor.

7. **Extension & Plugin Marketplace**:
   - Discover, install, activate, and manage community extensions (e.g., Prettier Formatter, ESLint Linter, GitLens Visualizer, Docker Tools, TailWind CSS IntelliSense).

8. **Integrated Terminal Shell**:
   - Run shell commands, npm scripts, git operations, and quick diagnostics directly from the bottom panel (`Ctrl + ~`).

---

## 🚀 Quick Start & Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Launch local development server on Port 3000 |
| `npm run dev:web` | Launch web application in browser mode |
| `npm run dev:desktop` | Launch native Electron desktop app window |
| `npm run check` | Run DexCode environment diagnostic verification |
| `npm run server` | Run production Express full-stack backend |
| `npm run build` | Compile frontend Vite web build |
| `npm run build:all` | Package installers for Windows, macOS, and Linux |
| `npm run build:win` | Build Windows `.exe` installer |
| `npm run build:mac` | Build macOS `.dmg` app bundle |
| `npm run build:linux` | Build Linux `.AppImage`, `.deb`, and `.rpm` packages |

---

## 🎨 Theme Customization & Keybindings

- **Command Palette**: Press `Ctrl + P` (or `Cmd + P`) to search files or trigger commands.
- **Toggle Terminal**: Press `Ctrl + ~` (or `Cmd + ~`) to show/hide the shell panel.
- **Toggle Primary Sidebar**: Press `Ctrl + B` (or `Cmd + B`).
- **Save File**: Press `Ctrl + S` (or `Cmd + S`).

---

© 2026 DexCode Core Team. All rights reserved.
