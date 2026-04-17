import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import log from 'electron-log';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;

const resolveStartUrl = () =>
    process.env.GEM_DUEL_WEB_URL ??
    `file://${path.join(__dirname, '../../web/.next/standalone/apps/web/index.html')}`;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1440,
        height: 960,
        backgroundColor: '#10151f',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    mainWindow.loadURL(resolveStartUrl()).catch((error) => {
        log.error('Failed to load web shell', error);
    });
};

ipcMain.handle('desktop:get-version', () => app.getVersion());

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
