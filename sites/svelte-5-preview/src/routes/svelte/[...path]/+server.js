import compiler_js from '../../../../../../packages/svelte/compiler/index.js?url';
import package_json from '../../../../../../packages/svelte/package.json?url';
import { read } from '$app/server';

const files = import.meta.glob('../../../../../../packages/svelte/src/**/*.js', {
	eager: true,
	query: '?url',
	import: 'default'
});

const prefix = '../../../../../../packages/svelte/';

export const prerender = true;

export function entries() {
	const entries = Object.keys(files).map((path) => ({ path: path.replace(prefix, '') }));
	entries.push({ path: 'compiler/index.js' }, { path: 'package.json' });
	return entries;
}

// service worker requests files under this path to load the compiler and runtime
export async function GET({ params }) {
	let file = '';

	if (params.path === 'compiler/index.js') {
		file = compiler_js;
	} else if (params.path === 'package.json') {
		file = package_json;
	} else {
		file = /** @type {string} */ (files[prefix + params.path]);

		// remove query string added by Vite when changing source code locally
		file = file.split('?')[0];
	}

	return read(file);
}
