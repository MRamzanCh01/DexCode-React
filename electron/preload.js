const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('dexcodeDesktop', {
  isElectron: true,
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window-maximize'),
  closeWindow: () => ipcRenderer.invoke('window-close'),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),
  onMenuCommand: (callback) => {
    const handler = (_event, command) => callback(command);
    ipcRenderer.on('menu-command', handler);
    return () => ipcRenderer.removeListener('menu-command', handler);
  },
  onFileOpened: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('file-opened', handler);
    return () => ipcRenderer.removeListener('file-opened', handler);
  },
  onFolderOpened: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('folder-opened', handler);
    return () => ipcRenderer.removeListener('folder-opened', handler);
  },
});
