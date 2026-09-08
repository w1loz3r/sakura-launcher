const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('launcherApi', {
  play: (payload) => ipcRenderer.invoke('launcher:play', payload),
  getConfig: () => ipcRenderer.invoke('launcher:getConfig'),
  saveConfig: (patch) => ipcRenderer.invoke('launcher:saveConfig', patch),
  onLog: (cb) => ipcRenderer.on('launcher:log', (_e, msg) => cb?.(msg))
});
