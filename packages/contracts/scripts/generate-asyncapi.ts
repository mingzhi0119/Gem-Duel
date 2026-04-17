import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { serializeStableYaml } from '../src/shared/serialization';
import { asyncApiDocument, validateAsyncApiDocument } from '../src/asyncapi';

const diagnostics = await validateAsyncApiDocument();
if (diagnostics.length > 0) {
    throw new Error(
        `AsyncAPI document is invalid:\n${diagnostics
            .map((diagnostic) => `- ${diagnostic.message}`)
            .join('\n')}`
    );
}

const outputPath = path.resolve(process.cwd(), 'generated', 'asyncapi', 'asyncapi.yaml');

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, serializeStableYaml(asyncApiDocument), 'utf8');
