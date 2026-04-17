import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { serializeStableJson, serializeStableYaml } from '../src/shared/serialization';
import { openApiDocument } from '../src/openapi';
import { asyncApiDocument, validateAsyncApiDocument } from '../src/asyncapi';

const tempDir = await mkdtemp(path.join(os.tmpdir(), 'gem-duel-contracts-'));

const expectedOutputs = [
    {
        label: 'OpenAPI generated artifact',
        path: path.resolve(process.cwd(), 'generated', 'openapi', 'openapi.json'),
        content: serializeStableJson(openApiDocument),
    },
    {
        label: 'AsyncAPI generated artifact',
        path: path.resolve(process.cwd(), 'generated', 'asyncapi', 'asyncapi.yaml'),
        content: serializeStableYaml(asyncApiDocument),
    },
    {
        label: 'OpenAPI fixture',
        path: path.resolve(process.cwd(), 'src', '__fixtures__', 'openapi.expected.json'),
        content: serializeStableJson(openApiDocument),
    },
    {
        label: 'AsyncAPI fixture',
        path: path.resolve(process.cwd(), 'src', '__fixtures__', 'asyncapi.expected.yaml'),
        content: serializeStableYaml(asyncApiDocument),
    },
];

try {
    const diagnostics = await validateAsyncApiDocument();
    if (diagnostics.length > 0) {
        throw new Error(
            `AsyncAPI document is invalid:\n${diagnostics
                .map((diagnostic) => `- ${diagnostic.message}`)
                .join('\n')}`
        );
    }

    const driftMessages: string[] = [];

    for (const output of expectedOutputs) {
        const tempFilePath = path.join(tempDir, path.basename(output.path));
        await writeFile(tempFilePath, output.content, 'utf8');

        const existing = await readFile(output.path, 'utf8').catch(() => null);
        if (existing === null) {
            driftMessages.push(`${output.label} is missing at ${output.path}`);
            continue;
        }

        if (existing !== output.content) {
            driftMessages.push(
                `${output.label} drifted from the generated document: ${output.path}`
            );
        }
    }

    if (driftMessages.length > 0) {
        throw new Error(driftMessages.join('\n'));
    }
} finally {
    await rm(tempDir, { recursive: true, force: true });
}
