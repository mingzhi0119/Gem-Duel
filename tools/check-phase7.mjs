import { spawn, spawnSync } from 'node:child_process';
import process from 'node:process';
import { resolvePort, startReplayFixtureServer, waitForServer } from './replay-fixture-server.mjs';

const HOST = '127.0.0.1';
const isWindows = process.platform === 'win32';

const commandFor = (binary) => (isWindows ? `${binary}.cmd` : binary);

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

const startWebServer = (port, replayBaseUrl) =>
    spawn(
        commandFor('pnpm'),
        [
            '--filter',
            '@gem-duel/web',
            'exec',
            'next',
            'start',
            '--hostname',
            HOST,
            '--port',
            String(port),
        ],
        {
            cwd: process.cwd(),
            stdio: 'inherit',
            shell: isWindows,
            env: {
                ...process.env,
                ROOM_SERVICE_URL: replayBaseUrl,
            },
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
    const webPort = await resolvePort('GEM_DUEL_PHASE7_PORT', 'check-phase7');
    const fixturePort = await resolvePort('GEM_DUEL_PHASE7_REPLAY_PORT', 'check-phase7 fixture');
    const baseUrl = `http://${HOST}:${webPort}`;
    const fixtureServer = await startReplayFixtureServer(fixturePort);

    await runCommand(commandFor('pnpm'), ['build:web']);

    const webServer = startWebServer(webPort, fixtureServer.baseUrl);
    const cleanup = async () => {
        stopServer(webServer);
        await fixtureServer.stop();
    };

    process.on('SIGINT', () => {
        void cleanup();
    });
    process.on('SIGTERM', () => {
        void cleanup();
    });

    try {
        await waitForServer(`${fixtureServer.baseUrl}/health`);
        await waitForServer(`${baseUrl}/replays/phase7-royal-milestone`);
        await runCommand(
            commandFor('pnpm'),
            ['exec', 'playwright', 'test', 'apps/web/tests/phase7', ...forwardArgs],
            {
                GEM_DUEL_VISUAL_BASE_URL: baseUrl,
            }
        );
    } finally {
        await cleanup();
    }
};

main().catch((error) => {
    console.error('[check-phase7] failed');
    if (error instanceof Error) {
        console.error(error.message);
    } else {
        console.error(String(error));
    }
    process.exitCode = 1;
});
