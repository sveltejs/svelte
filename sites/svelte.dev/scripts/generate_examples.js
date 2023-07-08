import { fileURLToPath } from 'node:url';
import { get_examples_data } from '../src/lib/server/examples/index.js';
import { mkdir, writeFile } from 'node:fs/promises';

const examples_data = await get_examples_data(
	fileURLToPath(new URL('../../../documentation/examples', import.meta.url))
);

try {
	await mkdir(new URL('../src/lib/generated/', import.meta.url), { recursive: true });
} catch {}

writeFile(
	new URL('../src/lib/generated/examples-data.js', import.meta.url),
	`export default ${JSON.stringify(examples_data)}`
);
