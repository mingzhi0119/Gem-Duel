import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { ENGINE_VERSION, ReplayBundleSchema } from '../index';

const replayFixtureRoot = path.resolve(process.cwd(), 'src', '__fixtures__', 'replay');

describe('replay fixtures', () => {
    it('parses the committed replay wire-shape fixtures', () => {
        const replay = JSON.parse(
            readFileSync(path.join(replayFixtureRoot, 'minimal-replay.json'), 'utf8')
        );

        expect(ReplayBundleSchema.parse(replay).engineVersion).toBe(ENGINE_VERSION);
    });
});
