import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import isDev from 'electron-is-dev';
import log from 'electron-log';
import pkg from 'electron-updater';
import { PeerServer } from 'peer';
const { autoUpdater } = pkg;

// Configure logging
autoUpdater.logger = log;
log.transports.file.level = 'debug';
log.info('App starting...');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let updateFailureCount = 0;
let peerServer = null; // Keep reference to prevent garbage collection

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
        title: `GemDuel v${app.getVersion()}`,
        backgroundColor: '#020617',
    });

    mainWindow.setMenuBarVisibility(false);

    const startUrl = isDev
        ? 'http://localhost:5173'
        : `file://${path.join(__dirname, '../dist/index.html')}`;

    mainWindow.loadURL(startUrl);

    if (isDev) {
        mainWindow.webContents.openDevTools();
    } else {
        autoUpdater.autoDownload = true;
        autoUpdater.allowPrerelease = true;
        autoUpdater.checkForUpdatesAndNotify();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

autoUpdater.on('checking-for-update', () => {
    log.info('Checking for update...');
});

autoUpdater.on('update-available', (info) => {
    log.info(
        `Update available: Current version ${app.getVersion()}, Available version ${info.version}`
    );
    if (mainWindow) mainWindow.webContents.send('update_available');
});

autoUpdater.on('update-not-available', () => {
    log.info('Update not available.');
});

autoUpdater.on('error', (err) => {
    log.error('Error in auto-updater:', err);
    updateFailureCount++;
    if (updateFailureCount > 2) {
        log.warn('Update failed multiple times. Resetting failure count.');
        updateFailureCount = 0;
        // Optional: Implement actual cache clearing if needed (e.g. deleting local app data folder for updates)
    }
});

autoUpdater.on('download-progress', (progressObj) => {
    log.info(`Download progress: ${progressObj.percent}%`);
    if (mainWindow) mainWindow.webContents.send('download_progress', progressObj.percent);
});

autoUpdater.on('update-downloaded', (info) => {
    log.info('Update downloaded; will install now', info);
    if (mainWindow) mainWindow.webContents.send('update_downloaded');
});

ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
});

ipcMain.handle('get-app-version', () => {
    return app.getVersion();
});

app.whenReady().then(() => {
    // Start Local PeerJS Signaling Server
    try {
        peerServer = PeerServer({
            port: 9000,
            path: '/gemduel',
            proxied: true,
        });

        log.info('[P2P] Local Signaling Server running on port 9000');
        console.log('[P2P] Local Signaling Server running on port 9000');

        peerServer.on('connection', (client) => {
            log.info(`[P2P] Client connected: ${client.getId()}`);
        });

        peerServer.on('disconnect', (client) => {
            log.info(`[P2P] Client disconnected: ${client.getId()}`);
        });
    } catch (err) {
        log.error('[P2P] Failed to start PeerServer:', err);
        console.error('[P2P] Failed to start PeerServer:', err);
    }

    createWindow();
});

app.on('window-all-closed', () => {
    // Clean up PeerServer on exit
    if (peerServer) {
        log.info('[P2P] Shutting down PeerServer...');
        // PeerServer doesn't have explicit close method, node will clean up
    }

    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
