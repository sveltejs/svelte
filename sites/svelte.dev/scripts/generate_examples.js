import { get_examples_data } from '../src/lib/server/examples/index.js';
import fs from 'node:fs';

let examples_path = new URL('../../../documentation/examples', import.meta.url).pathname;
if (process.platform === 'win32') {
	examples_path = examples_path.slice(1); // remove leading slash
}

const examples_data = get_examples_data(examples_path);

try {
	fs.mkdirSync(new URL('../src/lib/generated/', import.meta.url), { recursive: true });
} catch {}

fs.writeFileSync(
	new URL('../src/lib/generated/examples-data.js', import.meta.url),
	`export default ${JSON.stringify(examples_data)}`
);
