import { spawn } from 'node:child_process';
import process from 'node:process';
import { HOST, startStandaloneWebServer, stopServer } from './standalone-web-server.mjs';
import { resolvePort, waitForServer } from './replay-fixture-server.mjs';

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
        env: {
            ...process.env,
            ROOM_SERVICE_PORT: String(port),
        },
        shell: false,
    });

const forwardArgs = process.argv.slice(2);

const main = async () => {
    const roomServicePort = await resolvePort('GEM_DUEL_PHASE6_ROOM_PORT', 'check-phase6 room');
    const webPort = await resolvePort('GEM_DUEL_PHASE6_WEB_PORT', 'check-phase6 web');
    const baseUrl = `http://${HOST}:${webPort}`;

    await runCommand(commandFor('pnpm'), ['build:room']);
    await runCommand(commandFor('pnpm'), ['build:web']);

    const roomService = startRoomService(roomServicePort);
    const web = await startStandaloneWebServer(webPort, {
        ROOM_SERVICE_URL: `http://${HOST}:${roomServicePort}`,
    });
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
