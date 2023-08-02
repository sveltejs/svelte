// Fetch a REPL from svelte.dev and write the files to the src/ directory
// Usage: node fetch-repl.js <id> or node fetch-repl.js <url>

import { writeFileSync } from 'fs';
const id = process.argv[2];

if (!id) {
	throw new Error('Missing id');
}

let json_url = `https://svelte.dev/repl/api/${id}.json`;

try {
	const tmp = new URL(id);
	tmp.pathname = tmp.pathname.replace(/\/repl/, '/repl/api');
	tmp.pathname += '.json';
	json_url = tmp.href;
} catch {}

const repl_data = await fetch(json_url).then((r) => r.json());

for (const component of repl_data.components) {
	writeFileSync(`src/${component.name}.${component.type}`, component.source);
}
