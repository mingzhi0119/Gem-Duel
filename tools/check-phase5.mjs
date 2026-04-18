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

const forwardArgs = process.argv.slice(2);

const main = async () => {
    const port = await resolvePort('GEM_DUEL_PHASE5_PORT', 'check-phase5');
    const baseUrl = `http://${HOST}:${port}`;

    await runCommand(commandFor('pnpm'), ['build:web']);

    const server = await startStandaloneWebServer(port);
    const cleanup = () => stopServer(server);

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

    try {
        await waitForServer(`${baseUrl}/play/ai`);
        await runCommand(
            commandFor('pnpm'),
            ['exec', 'playwright', 'test', 'apps/web/tests/phase5', ...forwardArgs],
            {
                GEM_DUEL_VISUAL_BASE_URL: baseUrl,
            }
        );
    } finally {
        cleanup();
    }
};

main().catch((error) => {
    console.error('[check-phase5] failed');
    if (error instanceof Error) {
        console.error(error.message);
    } else {
        console.error(String(error));
    }
    process.exitCode = 1;
});
