import { createServer } from 'node:http';
import net from 'node:net';
import { readFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';

const HOST = '127.0.0.1';
const MIN_PORT = 10000;
const FIXTURE_ID = 'phase7-royal-milestone';
const FIXTURE_PATH = new URL(
    '../packages/core-engine/__replays__/golden/royal-milestone-selection.step04.json',
    import.meta.url
);

export const PHASE7_REPLAY_FIXTURE_ID = FIXTURE_ID;

export const resolvePort = async (envName, failureLabel) => {
    const fromEnv = process.env[envName];
    if (fromEnv) {
        return Number(fromEnv);
    }

    while (true) {
        // Keep retrying until we get a port in the stable range used by the browser gates.
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
                server.close(() =>
                    reject(new Error(`Unable to resolve a free port for ${failureLabel}`))
                );
            });
        });

        if (port >= MIN_PORT) {
            return port;
        }
    }
};

export const waitForServer = async (url, timeoutMs = 60000) => {
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

export const startReplayFixtureServer = async (port) => {
    const bundle = JSON.parse(await readFile(FIXTURE_PATH, 'utf8'));
    const server = createServer((request, response) => {
        if (!request.url) {
            response.writeHead(400);
            response.end();
            return;
        }

        const url = new URL(request.url, `http://${HOST}:${port}`);
        if (url.pathname === '/health') {
            response.writeHead(200, { 'content-type': 'application/json' });
            response.end(JSON.stringify({ status: 'ok', service: 'replay-fixture-server' }));
            return;
        }

        if (url.pathname === `/replays/${FIXTURE_ID}`) {
            response.writeHead(200, { 'content-type': 'application/json' });
            response.end(JSON.stringify({ replayId: FIXTURE_ID, bundle }));
            return;
        }

        response.writeHead(404, { 'content-type': 'application/json' });
        response.end(
            JSON.stringify({ ok: false, message: `Replay ${url.pathname} was not found.` })
        );
    });

    await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(port, HOST, () => resolve(undefined));
    });

    return {
        baseUrl: `http://${HOST}:${port}`,
        stop: async () => {
            await new Promise((resolve, reject) => {
                server.close((error) => (error ? reject(error) : resolve(undefined)));
            });
        },
    };
};
