const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
});

contextBridge.exposeInMainWorld('ipcRenderer', {
    send: (channel, data) => ipcRenderer.send(channel, data),
    on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
});
