import { spawn, spawnSync, type ChildProcessByStdio } from 'node:child_process';
import fs from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import process from 'node:process';
import { Readable } from 'node:stream';
import { setTimeout as delay } from 'node:timers/promises';
import log from 'electron-log';

const HOST = '127.0.0.1';
const STARTUP_TIMEOUT_MS = 60_000;

export interface DesktopWebRuntime {
    targetUrl: string;
    stop: () => void;
}

const resolveConfiguredUrl = () => {
    const value = process.env.GEM_DUEL_WEB_URL?.trim();
    return value ? value : null;
};

export const resolveStandaloneServerScript = (desktopRuntimeDir: string) =>
    path.resolve(desktopRuntimeDir, '../../web/.next/standalone/apps/web/server.js');

export const resolveDesktopBaseUrl = (port: number) => `http://${HOST}:${String(port)}`;

const resolveStandaloneAppDir = (desktopRuntimeDir: string) =>
    path.dirname(resolveStandaloneServerScript(desktopRuntimeDir));

const resolveWebBuildDir = (desktopRuntimeDir: string) =>
    path.resolve(desktopRuntimeDir, '../../web/.next');

const resolvePort = async () => {
    const configuredPort = process.env.GEM_DUEL_DESKTOP_PORT;
    if (configuredPort) {
        const parsedPort = Number(configuredPort);
        if (!Number.isNaN(parsedPort) && Number.isFinite(parsedPort)) {
            return parsedPort;
        }
        throw new Error(`Invalid GEM_DUEL_DESKTOP_PORT: ${configuredPort}`);
    }

    return await new Promise<number>((resolve, reject) => {
        const server = net.createServer();
        server.unref();
        server.on('error', reject);
        server.listen(0, HOST, () => {
            const address = server.address();
            if (address && typeof address === 'object') {
                server.close(() => resolve(address.port));
                return;
            }
            server.close(() =>
                reject(new Error('Unable to resolve a free port for the desktop web runtime'))
            );
        });
    });
};

const waitForServer = async (url: string, timeoutMs = STARTUP_TIMEOUT_MS) => {
    const startedAt = Date.now();
    let lastError: unknown = null;

    while (Date.now() - startedAt < timeoutMs) {
        try {
            const response = await fetch(url, {
                redirect: 'manual',
            });
            if (response.ok || response.status === 307 || response.status === 308) {
                return;
            }
            lastError = new Error(`Unexpected response status ${String(response.status)}`);
        } catch (error) {
            lastError = error;
        }

        await delay(1_000);
    }

    throw new Error(
        `Timed out waiting for ${url}${lastError instanceof Error ? `: ${lastError.message}` : ''}`
    );
};

type DesktopWebServerChild = ChildProcessByStdio<null, Readable, Readable>;

const stopChildProcess = (child: DesktopWebServerChild | null) => {
    if (!child || child.killed || child.pid == null) {
        return;
    }

    if (process.platform === 'win32') {
        spawnSync('taskkill', ['/pid', String(child.pid), '/t', '/f'], {
            stdio: 'ignore',
        });
        return;
    }

    child.kill('SIGTERM');
};

const forwardProcessLogs = (
    child: DesktopWebServerChild,
    stream: NodeJS.ReadableStream | null,
    level: 'info' | 'error'
) => {
    if (!stream) {
        return;
    }

    stream.setEncoding('utf8');
    let buffer = '';
    stream.on('data', (chunk: string) => {
        buffer += chunk;
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() ?? '';
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.length > 0) {
                log[level](`[desktop-web-runtime:${String(child.pid)}] ${trimmed}`);
            }
        }
    });
    stream.on('end', () => {
        const trimmed = buffer.trim();
        if (trimmed.length > 0) {
            log[level](`[desktop-web-runtime:${String(child.pid)}] ${trimmed}`);
        }
    });
};

const ensureStandaloneAssets = async (desktopRuntimeDir: string) => {
    const standaloneAppDir = resolveStandaloneAppDir(desktopRuntimeDir);
    const webBuildDir = resolveWebBuildDir(desktopRuntimeDir);
    const staticSource = path.join(webBuildDir, 'static');
    const staticDestination = path.join(standaloneAppDir, '.next', 'static');

    if (
        !(await fs
            .stat(staticDestination)
            .then(() => true)
            .catch(() => false))
    ) {
        await fs.mkdir(path.dirname(staticDestination), {
            recursive: true,
        });
        await fs.cp(staticSource, staticDestination, {
            recursive: true,
            force: true,
        });
    }
};

const createBundledRuntime = async (desktopRuntimeDir: string): Promise<DesktopWebRuntime> => {
    const serverScript = resolveStandaloneServerScript(desktopRuntimeDir);
    await fs.access(serverScript);
    await ensureStandaloneAssets(desktopRuntimeDir);

    const port = await resolvePort();
    const targetUrl = resolveDesktopBaseUrl(port);
    const child = spawn(process.execPath, [serverScript], {
        cwd: path.dirname(serverScript),
        env: {
            ...process.env,
            ELECTRON_RUN_AS_NODE: '1',
            HOSTNAME: HOST,
            PORT: String(port),
        },
        stdio: ['ignore', 'pipe', 'pipe'],
    });

    forwardProcessLogs(child, child.stdout, 'info');
    forwardProcessLogs(child, child.stderr, 'error');

    try {
        await waitForServer(`${targetUrl}/play/local`);
    } catch (error) {
        stopChildProcess(child);
        throw error;
    }

    return {
        targetUrl,
        stop: () => stopChildProcess(child),
    };
};

export const createDesktopWebRuntime = async (
    desktopRuntimeDir: string
): Promise<DesktopWebRuntime> => {
    const configuredUrl = resolveConfiguredUrl();
    if (configuredUrl) {
        return {
            targetUrl: configuredUrl,
            stop: () => {},
        };
    }

    return await createBundledRuntime(desktopRuntimeDir);
};
