import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';

const { values, positionals } = parseArgs({
	options: {
		'create-test': {
			type: 'string'
		}
	},
	allowPositionals: true
});

const create_test_name = values['create-test'] ?? null;
const url_arg = positionals[0];

if (!url_arg) {
	console.error(`Missing URL argument`);
	process.exit(1);
}

/** @type {URL} */
let url;

try {
	url = new URL(url_arg);
} catch (e) {
	console.error(`${url_arg} is not a URL`);
	process.exit(1);
}

if (url.origin !== 'https://svelte.dev' || !url.pathname.startsWith('/playground/')) {
	console.error(`${url_arg} is not a Svelte playground URL`);
	process.exit(1);
}

let files;

if (url.hash.length > 1) {
	const decoded = atob(url.hash.slice(1).replaceAll('-', '+').replaceAll('_', '/'));
	// putting it directly into the blob gives a corrupted file
	const u8 = new Uint8Array(decoded.length);
	for (let i = 0; i < decoded.length; i++) {
		u8[i] = decoded.charCodeAt(i);
	}
	const stream = new Blob([u8]).stream().pipeThrough(new DecompressionStream('gzip'));
	const json = await new Response(stream).text();

	files = JSON.parse(json).files;
} else {
	const id = url.pathname.split('/')[2];
	const response = await fetch(`https://svelte.dev/playground/api/${id}.json`);

	files = (await response.json()).components.map((data) => {
		const basename = `${data.name}.${data.type}`;

		return {
			type: 'file',
			name: basename,
			basename,
			contents: data.source,
			text: true
		};
	});
}

const base_dir = import.meta.dirname;

if (create_test_name) {
	const test_parts = create_test_name.split('/').filter(Boolean);

	if (test_parts.length > 2) {
		console.error(
			`Invalid test name "${create_test_name}". Expected e.g. "hello-world" or "runtime-legacy/hello-world"`
		);
		process.exit(1);
	}

	const suite_name = test_parts.length === 2 ? test_parts[0] : 'runtime-runes';
	const test_name = test_parts[test_parts.length - 1];

	const output_dir = path.join(
		base_dir,
		'../../..',
		'packages/svelte/tests',
		suite_name,
		'samples',
		test_name
	);
	if (fs.existsSync(output_dir)) {
		console.warn(`Test folder "${output_dir}" already exists, overriding its contents`);
		fs.rmSync(output_dir, { recursive: true, force: true });
	}
	fs.mkdirSync(output_dir, { recursive: true });

	for (const file of files) {
		const output_name = file.name === 'App.svelte' ? 'main.svelte' : file.name;
		const output_path = path.join(output_dir, output_name);

		fs.mkdirSync(path.dirname(output_path), { recursive: true });
		fs.writeFileSync(output_path, file.contents);
	}

	fs.writeFileSync(
		path.join(output_dir, '_config.js'),
		`import { test } from '../../test';

export default test({
	async test({ assert, target }) {
	}
});
`
	);
} else {
	for (const file of files) {
		fs.writeFileSync(path.join(base_dir, '..', 'src', file.name), file.contents);
	}
}
