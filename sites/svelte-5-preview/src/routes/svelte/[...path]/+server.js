import compiler_cjs from '../../../../../../packages/svelte/compiler.cjs?url';
import package_json from '../../../../../../packages/svelte/package.json?url';
import { read } from '$app/server';

const files = import.meta.glob('../../../../../../packages/svelte/src/**/*.js', {
	eager: true,
	as: 'url'
});

const prefix = '../../../../../../packages/svelte/';

export const prerender = true;

export function entries() {
	const entries = Object.keys(files).map((path) => ({ path: path.replace(prefix, '') }));
	entries.push({ path: 'compiler.cjs' }, { path: 'package.json' });
	return entries;
}

// service worker requests files under this path to load the compiler and runtime
export async function GET({ params }) {
	let url = '';
	if (params.path === 'compiler.cjs') {
		url = compiler_cjs;
	} else if (params.path === 'package.json') {
		url = package_json;
	} else {
		url = files[prefix + params.path];
	}

	return read(url);
}
