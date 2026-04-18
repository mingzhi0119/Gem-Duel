import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
    resolveDesktopBaseUrl,
    resolveDesktopTargetUrl,
    resolveStandaloneServerScript,
} from './web-runtime.js';

describe('desktop web runtime helpers', () => {
    it('resolves the bundled standalone server relative to the desktop dist directory', () => {
        const runtimeDir = path.join(process.cwd(), 'dist');

        expect(resolveStandaloneServerScript(runtimeDir)).toBe(
            path.resolve(process.cwd(), '../web/.next/standalone/apps/web/server.js')
        );
    });

    it('builds a loopback base url for the embedded web runtime', () => {
        expect(resolveDesktopBaseUrl(4319)).toBe('http://127.0.0.1:4319');
    });

    it('leaves the base url untouched when no desktop start path is configured', () => {
        expect(resolveDesktopTargetUrl('http://127.0.0.1:4319')).toBe('http://127.0.0.1:4319');
    });
});
