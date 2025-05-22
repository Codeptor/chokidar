const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  getFiles: (folderPath) => ipcRenderer.invoke('get-files', folderPath),
  organizeFiles: (folderPath) => ipcRenderer.invoke('organize-files', folderPath),
  startWatching: (folderPath) => ipcRenderer.invoke('start-watching', folderPath),
  stopWatching: () => ipcRenderer.invoke('stop-watching'),
  
  onFileMoved: (callback) => ipcRenderer.on('file-moved', callback),
  onFileError: (callback) => ipcRenderer.on('file-error', callback)
});
