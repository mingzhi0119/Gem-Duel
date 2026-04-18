import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('desktopShell', {
    getVersion: () => ipcRenderer.invoke('desktop:get-version'),
});
