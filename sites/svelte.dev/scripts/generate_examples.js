import { get_examples_data } from '../src/lib/server/examples/get-examples.js';
import fs from 'node:fs';

const examples_data = get_examples_data(
	new URL('../../../site/content/examples', import.meta.url).pathname
);

fs.writeFileSync(
	new URL('../src/routes/(authed)/repl/[id].json/examples-data.js', import.meta.url),
	`export default ${JSON.stringify(examples_data)}`
);
