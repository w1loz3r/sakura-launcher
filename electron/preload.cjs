const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('launcherApi', {
  getConfig: () => ipcRenderer.invoke('launcher:getConfig'),
  saveConfig: (patch) => ipcRenderer.invoke('launcher:saveConfig', patch),
  play: (payload) => ipcRenderer.invoke('launcher:play', payload),
  onLog: (cb) => ipcRenderer.on('launcher:log', (_e, msg) => cb?.(msg))
});
