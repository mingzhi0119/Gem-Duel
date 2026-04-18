import { spawn, spawnSync } from 'node:child_process';
import net from 'node:net';
import process from 'node:process';
import { setTimeout as delay } from 'node:timers/promises';

const HOST = '127.0.0.1';
const isWindows = process.platform === 'win32';

const commandFor = (binary) => (isWindows ? `${binary}.cmd` : binary);

const resolvePort = async () => {
    if (process.env.GEM_DUEL_PHASE4_PORT) {
        return Number(process.env.GEM_DUEL_PHASE4_PORT);
    }

    return await new Promise((resolve, reject) => {
        const server = net.createServer();
        server.unref();
        server.on('error', reject);
        server.listen(0, HOST, () => {
            const address = server.address();
            if (address && typeof address === 'object') {
                const { port } = address;
                server.close(() => resolve(port));
                return;
            }
            server.close(() => reject(new Error('Unable to resolve a free port for check-phase4')));
        });
    });
};

const runCommand = (command, args, extraEnv = {}) =>
    new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            cwd: process.cwd(),
            stdio: 'inherit',
            shell: isWindows,
            env: {
                ...process.env,
                ...extraEnv,
            },
        });

        child.on('exit', (code, signal) => {
            if (code === 0) {
                resolve();
                return;
            }
            reject(
                new Error(
                    `${command} ${args.join(' ')} exited with code ${String(code)}${signal ? ` (signal: ${signal})` : ''}`
                )
            );
        });
    });

const waitForServer = async (url, timeoutMs = 60000) => {
    const startedAt = Date.now();
    let lastError;

    while (Date.now() - startedAt < timeoutMs) {
        try {
            const response = await fetch(url, {
                redirect: 'manual',
            });
            if (response.ok || response.status === 307 || response.status === 308) {
                return;
            }
        } catch (error) {
            lastError = error;
        }
        await delay(1000);
    }

    throw new Error(
        `Timed out waiting for ${url}${lastError instanceof Error ? `: ${lastError.message}` : ''}`
    );
};

const startServer = (port) =>
    spawn(process.execPath, ['apps/web/.next/standalone/apps/web/server.js'], {
        cwd: process.cwd(),
        stdio: 'inherit',
        env: {
            ...process.env,
            HOSTNAME: HOST,
            PORT: String(port),
        },
    });

const stopServer = (server) => {
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

const forwardArgs = process.argv.slice(2);

const main = async () => {
    const port = await resolvePort();
    const baseUrl = `http://${HOST}:${port}`;

    await runCommand(commandFor('pnpm'), ['build:web']);

    const server = startServer(port);
    const cleanup = () => stopServer(server);

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

    try {
        await waitForServer(`${baseUrl}/play/local`);
        await runCommand(
            commandFor('pnpm'),
            [
                'exec',
                'playwright',
                'test',
                'apps/web/tests/phase4/local-scenario-bootstrap.spec.ts',
                ...forwardArgs,
            ],
            {
                GEM_DUEL_VISUAL_BASE_URL: baseUrl,
            }
        );
    } finally {
        cleanup();
    }
};

main().catch((error) => {
    console.error('[check-phase4] failed');
    if (error instanceof Error) {
        console.error(error.message);
    } else {
        console.error(String(error));
    }
    process.exitCode = 1;
});
