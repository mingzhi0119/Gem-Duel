import { spawn, spawnSync } from 'node:child_process';
import net from 'node:net';
import process from 'node:process';
import { setTimeout as delay } from 'node:timers/promises';

const HOST = '127.0.0.1';
const isWindows = process.platform === 'win32';

const commandFor = (binary) => (isWindows ? `${binary}.cmd` : binary);

const resolvePort = async (envName, label) => {
    if (process.env[envName]) {
        return Number(process.env[envName]);
    }

    while (true) {
        const port = await new Promise((resolve, reject) => {
            const server = net.createServer();
            server.unref();
            server.on('error', reject);
            server.listen(0, HOST, () => {
                const address = server.address();
                if (address && typeof address === 'object') {
                    server.close(() => resolve(address.port));
                    return;
                }
                server.close(() => reject(new Error(`Unable to resolve a free port for ${label}`)));
            });
        });

        if (typeof port === 'number' && port >= 10_000) {
            return port;
        }
    }
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
            const response = await fetch(url, { redirect: 'manual' });
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

const startRoomService = (port) =>
    spawn(process.execPath, ['node_modules/tsx/dist/cli.mjs', 'apps/room-service/src/index.ts'], {
        cwd: process.cwd(),
        stdio: 'ignore',
        env: {
            ...process.env,
            ROOM_SERVICE_PORT: String(port),
        },
        shell: false,
    });

const startWeb = (port, roomServicePort) =>
    spawn(
        process.execPath,
        ['node_modules/next/dist/bin/next', 'start', '--hostname', HOST, '--port', String(port)],
        {
            cwd: `${process.cwd()}/apps/web`,
            stdio: 'ignore',
            env: {
                ...process.env,
                ROOM_SERVICE_URL: `http://${HOST}:${roomServicePort}`,
            },
            shell: false,
        }
    );

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
    const roomServicePort = await resolvePort('GEM_DUEL_PHASE6_ROOM_PORT', 'check-phase6 room');
    const webPort = await resolvePort('GEM_DUEL_PHASE6_WEB_PORT', 'check-phase6 web');
    const baseUrl = `http://${HOST}:${webPort}`;

    await runCommand(commandFor('pnpm'), ['build:room']);
    await runCommand(commandFor('pnpm'), ['build:web']);

    const roomService = startRoomService(roomServicePort);
    const web = startWeb(webPort, roomServicePort);
    const cleanup = () => {
        stopServer(web);
        stopServer(roomService);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

    try {
        await waitForServer(`http://${HOST}:${roomServicePort}/health`);
        await waitForServer(`${baseUrl}/rooms`);
        await runCommand(
            commandFor('pnpm'),
            ['exec', 'playwright', 'test', 'apps/web/tests/phase6', ...forwardArgs],
            {
                GEM_DUEL_VISUAL_BASE_URL: baseUrl,
            }
        );
    } finally {
        cleanup();
    }
};

main().catch((error) => {
    console.error('[check-phase6] failed');
    if (error instanceof Error) {
        console.error(error.message);
    } else {
        console.error(String(error));
    }
    process.exitCode = 1;
});
