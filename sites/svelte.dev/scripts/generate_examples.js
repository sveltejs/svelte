import { get_examples_data } from '../src/lib/server/examples/get-examples.js';
import fs from 'node:fs';

const examples_data = get_examples_data(
	new URL('../../../site/content/examples', import.meta.url).pathname
);

fs.mkdirSync(new URL('../src/lib/generated/', import.meta.url), { recursive: true });

fs.writeFileSync(
	new URL('../src/lib/generated/examples-data.js', import.meta.url),
	`export default ${JSON.stringify(examples_data)}`
);
