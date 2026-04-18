import { spawn } from 'node:child_process';
import process from 'node:process';
import { HOST, startStandaloneWebServer, stopServer } from './standalone-web-server.mjs';
import { resolvePort, startReplayFixtureServer, waitForServer } from './replay-fixture-server.mjs';

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

const forwardArgs = process.argv.slice(2);

const main = async () => {
    if (process.env.CI && forwardArgs.some((arg) => arg.startsWith('--update-snapshots'))) {
        throw new Error('check-visual may not run with --update-snapshots in CI.');
    }

    const port = await resolvePort('GEM_DUEL_VISUAL_PORT', 'check-visual');
    const fixturePort = await resolvePort('GEM_DUEL_VISUAL_REPLAY_PORT', 'check-visual fixture');
    const baseUrl = `http://${HOST}:${port}`;
    const fixtureServer = await startReplayFixtureServer(fixturePort);

    await runCommand(commandFor('pnpm'), ['build:web']);

    const server = await startStandaloneWebServer(port, {
        ROOM_SERVICE_URL: fixtureServer.baseUrl,
    });
    const cleanup = async () => {
        stopServer(server);
        await fixtureServer.stop();
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

    try {
        await waitForServer(`${fixtureServer.baseUrl}/health`);
        await waitForServer(`${baseUrl}/playground`);
        await runCommand(
            commandFor('pnpm'),
            ['exec', 'playwright', 'test', 'apps/web/tests/visual', ...forwardArgs],
            {
                GEM_DUEL_VISUAL_BASE_URL: baseUrl,
            }
        );
    } finally {
        await cleanup();
    }
};

main().catch((error) => {
    console.error('[check-visual] failed');
    if (error instanceof Error) {
        console.error(error.message);
    } else {
        console.error(String(error));
    }
    process.exitCode = 1;
});
