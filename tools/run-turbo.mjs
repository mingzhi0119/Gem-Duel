import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const args = process.argv.slice(2);

if (args.length === 0) {
    console.error('Usage: node ./tools/run-turbo.mjs <turbo-args>');
    process.exit(1);
}

const turboEntry = fileURLToPath(new URL('../node_modules/turbo/bin/turbo', import.meta.url));

const child = spawn(process.execPath, [turboEntry, ...args], {
    cwd: process.cwd(),
    stdio: 'inherit',
    env: {
        ...process.env,
        TURBO_DANGEROUSLY_DISABLE_PACKAGE_MANAGER_CHECK: '1',
    },
});

child.on('exit', (code, signal) => {
    if (signal) {
        process.kill(process.pid, signal);
        return;
    }

    process.exit(code ?? 1);
});
