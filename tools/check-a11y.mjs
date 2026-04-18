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

const startRoomService = (port) =>
    spawn(process.execPath, ['node_modules/tsx/dist/cli.mjs', 'apps/room-service/src/index.ts'], {
        cwd: process.cwd(),
        stdio: 'ignore',
        shell: false,
        env: {
            ...process.env,
            ROOM_SERVICE_PORT: String(port),
        },
    });

const runPlaywright = (suitePath, baseUrl, extraEnv = {}) =>
    runCommand(commandFor('pnpm'), ['exec', 'playwright', 'test', suitePath], {
        GEM_DUEL_VISUAL_BASE_URL: baseUrl,
        ...extraEnv,
    });

const withServers = async ({ roomServiceUrl, webPort, run }) => {
    const web = await startStandaloneWebServer(webPort, {
        ROOM_SERVICE_URL: roomServiceUrl,
    });

    try {
        await waitForServer(`${roomServiceUrl}/health`);
        await waitForServer(`http://${HOST}:${webPort}/`);
        await run(`http://${HOST}:${webPort}`);
    } finally {
        stopServer(web);
    }
};

const main = async () => {
    const roomServicePort = await resolvePort('GEM_DUEL_A11Y_ROOM_PORT', 'check-a11y room');
    const productWebPort = await resolvePort('GEM_DUEL_A11Y_WEB_PORT', 'check-a11y web');
    const replayFixturePort = await resolvePort('GEM_DUEL_A11Y_REPLAY_PORT', 'check-a11y replay');
    const replayWebPort = await resolvePort(
        'GEM_DUEL_A11Y_REPLAY_WEB_PORT',
        'check-a11y replay web'
    );

    await runCommand(commandFor('pnpm'), ['build:room']);
    await runCommand(commandFor('pnpm'), ['build:web']);

    const roomService = startRoomService(roomServicePort);
    const replayFixture = await startReplayFixtureServer(replayFixturePort);

    try {
        await withServers({
            roomServiceUrl: `http://${HOST}:${roomServicePort}`,
            webPort: productWebPort,
            run: async (baseUrl) => {
                await runPlaywright('apps/web/tests/a11y/product-surfaces.spec.ts', baseUrl);
            },
        });

        await withServers({
            roomServiceUrl: replayFixture.baseUrl,
            webPort: replayWebPort,
            run: async (baseUrl) => {
                await runPlaywright('apps/web/tests/a11y/replay-surface.spec.ts', baseUrl);
            },
        });
    } finally {
        stopServer(roomService);
        await replayFixture.stop();
    }
};

main().catch((error) => {
    console.error('[check-a11y] failed');
    if (error instanceof Error) {
        console.error(error.message);
    } else {
        console.error(String(error));
    }
    process.exitCode = 1;
});
