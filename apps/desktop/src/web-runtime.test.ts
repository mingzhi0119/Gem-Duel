import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { resolveDesktopBaseUrl, resolveStandaloneServerScript } from './web-runtime.js';

describe('desktop web runtime helpers', () => {
    it('resolves the bundled standalone server relative to the desktop dist directory', () => {
        const runtimeDir = path.join('E:', 'simonbb', 'Gem-Duel', 'apps', 'desktop', 'dist');

        expect(resolveStandaloneServerScript(runtimeDir)).toBe(
            path.join(
                'E:',
                'simonbb',
                'Gem-Duel',
                'apps',
                'web',
                '.next',
                'standalone',
                'apps',
                'web',
                'server.js'
            )
        );
    });

    it('builds a loopback base url for the embedded web runtime', () => {
        expect(resolveDesktopBaseUrl(4319)).toBe('http://127.0.0.1:4319');
    });
});
