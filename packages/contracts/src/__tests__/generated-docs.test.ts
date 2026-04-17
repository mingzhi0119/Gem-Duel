import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { serializeStableJson, serializeStableYaml } from '../shared/serialization';
import { openApiDocument } from '../openapi';
import { asyncApiDocument, validateAsyncApiDocument } from '../asyncapi';

const fixtureRoot = path.resolve(process.cwd(), 'src', '__fixtures__');
const generatedRoot = path.resolve(process.cwd(), 'generated');

describe('generated contract documents', () => {
    it('matches the committed OpenAPI fixture and generated artifact', () => {
        const expected = readFileSync(path.join(fixtureRoot, 'openapi.expected.json'), 'utf8');
        const generated = readFileSync(path.join(generatedRoot, 'openapi', 'openapi.json'), 'utf8');
        const actual = serializeStableJson(openApiDocument);

        expect(actual).toBe(expected);
        expect(actual).toBe(generated);
    });

    it('matches the committed AsyncAPI fixture and generated artifact', async () => {
        const expected = readFileSync(path.join(fixtureRoot, 'asyncapi.expected.yaml'), 'utf8');
        const generated = readFileSync(
            path.join(generatedRoot, 'asyncapi', 'asyncapi.yaml'),
            'utf8'
        );
        const actual = serializeStableYaml(asyncApiDocument);
        const diagnostics = await validateAsyncApiDocument();

        expect(diagnostics).toEqual([]);
        expect(actual).toBe(expected);
        expect(actual).toBe(generated);
    });
});
