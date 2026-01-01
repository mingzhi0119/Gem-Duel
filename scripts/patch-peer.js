import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const peerPackagePath = path.join(__dirname, '../node_modules/peer/package.json');

if (fs.existsSync(peerPackagePath)) {
    try {
        const pkg = JSON.parse(fs.readFileSync(peerPackagePath, 'utf8'));

        if (pkg.binary) {
            console.log(
                '[PATCH] Renaming "binary" field in peer/package.json to fix electron-builder error.'
            );
            pkg._binary = pkg.binary;
            delete pkg.binary;

            fs.writeFileSync(peerPackagePath, JSON.stringify(pkg, null, 2));
            console.log('[PATCH] Successfully patched peer/package.json');
        } else {
            console.log('[PATCH] "binary" field not found in peer/package.json, skipping.');
        }
    } catch (err) {
        console.error('[PATCH] Failed to patch peer/package.json:', err.message);
    }
} else {
    console.error('[PATCH] peer/package.json not found. Make sure peer is installed.');
}
