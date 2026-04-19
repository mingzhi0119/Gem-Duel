import { spawn } from 'node:child_process';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import sharp from 'sharp';
import { HOST, startStandaloneWebServer, stopServer } from './standalone-web-server.mjs';
import { resolvePort, startReplayFixtureServer, waitForServer } from './replay-fixture-server.mjs';

const isWindows = process.platform === 'win32';

const commandFor = (binary) => (isWindows ? `${binary}.cmd` : binary);
const hasSnapshotUpdateFlag = (args) => args.some((arg) => arg.startsWith('--update-snapshots'));

const collectSnapshotPngs = async (directory) => {
    const entries = await readdir(directory, { withFileTypes: true });
    const files = await Promise.all(
        entries.map(async (entry) => {
            const resolvedPath = path.join(directory, entry.name);
            if (entry.isDirectory()) {
                return collectSnapshotPngs(resolvedPath);
            }
            return entry.isFile() && entry.name.endsWith('.png') ? [resolvedPath] : [];
        })
    );

    return files.flat();
};

const formatBytes = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

const optimizeSnapshotPngs = async (snapshotRoot) => {
    const pngs = await collectSnapshotPngs(snapshotRoot);
    let totalBefore = 0;
    let totalAfter = 0;
    let rewrittenCount = 0;

    for (const pngPath of pngs) {
        const input = await readFile(pngPath);
        totalBefore += input.byteLength;

        const optimized = await sharp(input)
            .png({
                compressionLevel: 9,
                adaptiveFiltering: true,
                effort: 10,
                palette: false,
            })
            .toBuffer();

        const output = optimized.byteLength <= input.byteLength ? optimized : input;
        totalAfter += output.byteLength;

        if (output !== input) {
            rewrittenCount += 1;
            await writeFile(pngPath, output);
        }
    }

    console.log(
        `[check-visual] optimized ${rewrittenCount}/${pngs.length} PNG baselines (${formatBytes(totalBefore)} -> ${formatBytes(totalAfter)})`
    );
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

const forwardArgs = process.argv.slice(2);
const visualSnapshotRoot = path.join(process.cwd(), 'apps', 'web', 'tests', 'visual');

const main = async () => {
    if (process.env.CI && hasSnapshotUpdateFlag(forwardArgs)) {
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
        if (hasSnapshotUpdateFlag(forwardArgs)) {
            await optimizeSnapshotPngs(visualSnapshotRoot);
        }
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
