import { spawn, spawnSync } from 'node:child_process';
import { cp, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

export const HOST = '127.0.0.1';

const isWindows = process.platform === 'win32';

const resolveStandaloneServerScript = () =>
    path.resolve(process.cwd(), 'apps/web/.next/standalone/apps/web/server.js');

const resolveStandaloneAppDir = () => path.dirname(resolveStandaloneServerScript());

const resolveStandaloneStaticDir = () => path.join(resolveStandaloneAppDir(), '.next', 'static');

const resolveBuiltStaticDir = () => path.resolve(process.cwd(), 'apps/web/.next/static');

const pathExists = async (targetPath) => {
    try {
        await stat(targetPath);
        return true;
    } catch {
        return false;
    }
};

export const ensureStandaloneAssets = async () => {
    const sourceDir = resolveBuiltStaticDir();
    const targetDir = resolveStandaloneStaticDir();

    if (!(await pathExists(sourceDir))) {
        throw new Error(`Missing Next static assets at ${sourceDir}. Run pnpm build:web first.`);
    }

    if (await pathExists(targetDir)) {
        return;
    }

    await mkdir(path.dirname(targetDir), { recursive: true });
    await cp(sourceDir, targetDir, { recursive: true });
};

export const startStandaloneWebServer = async (port, extraEnv = {}) => {
    const serverScript = resolveStandaloneServerScript();
    if (!(await pathExists(serverScript))) {
        throw new Error(`Missing standalone server at ${serverScript}. Run pnpm build:web first.`);
    }

    await ensureStandaloneAssets();

    return spawn(process.execPath, [serverScript], {
        cwd: path.dirname(serverScript),
        stdio: 'inherit',
        shell: false,
        env: {
            ...process.env,
            PORT: String(port),
            HOSTNAME: HOST,
            ...extraEnv,
        },
    });
};

export const stopServer = (server) => {
    if (!server || server.killed || server.pid == null) {
        return;
    }

    if (isWindows) {
        spawnSync('taskkill', ['/pid', String(server.pid), '/t', '/f'], {
            stdio: 'ignore',
        });
        return;
    }

    server.kill('SIGTERM');
};
