import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import log from 'electron-log';
import { createDesktopWebRuntime, type DesktopWebRuntime } from './web-runtime.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let webRuntime: DesktopWebRuntime | null = null;

const stopWebRuntime = () => {
    webRuntime?.stop();
    webRuntime = null;
};

const createWindow = async () => {
    webRuntime ??= await createDesktopWebRuntime(__dirname);
    mainWindow = new BrowserWindow({
        width: 1440,
        height: 960,
        backgroundColor: '#10151f',
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
        },
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, url) => {
        log.error('Desktop shell load failure', {
            errorCode,
            errorDescription,
            url,
        });
    });

    await mainWindow.loadURL(webRuntime.targetUrl).catch((error) => {
        log.error('Failed to load web shell', error);
        stopWebRuntime();
        throw error;
    });
};

ipcMain.handle('desktop:get-version', () => app.getVersion());

app.whenReady()
    .then(async () => {
        await createWindow();
        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                void createWindow();
            }
        });
    })
    .catch((error) => {
        log.error('Desktop startup failed', error);
        stopWebRuntime();
        app.exit(1);
    });

app.on('before-quit', () => {
    stopWebRuntime();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        stopWebRuntime();
        app.quit();
    }
});
