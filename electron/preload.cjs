const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('launcherApi', {
  play: () => ipcRenderer.invoke('launcher:play')
});
