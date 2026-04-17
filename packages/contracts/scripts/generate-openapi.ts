import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { serializeStableJson } from '../src/shared/serialization';
import { openApiDocument } from '../src/openapi';

const outputPath = path.resolve(process.cwd(), 'generated', 'openapi', 'openapi.json');

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, serializeStableJson(openApiDocument), 'utf8');
