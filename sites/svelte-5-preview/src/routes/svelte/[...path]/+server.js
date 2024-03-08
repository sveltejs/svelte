import compiler_cjs from '../../../../../../packages/svelte/compiler.cjs?url';
import package_json from '../../../../../../packages/svelte/package.json?url';
import { read } from '$app/server';

const files = import.meta.glob('../../../../../../packages/svelte/src/**/*.js', {
	eager: true,
	as: 'url'
});

// service worker requests files under this path to load the compiler and runtime
export function GET({ params }) {
	let url = '';
	if (params.path === 'compiler.cjs') {
		url = compiler_cjs;
	} else if (params.path === 'package.json') {
		url = package_json;
	} else {
		const path = '../../../../../../packages/svelte/' + params.path;
		url = files[path];
	}

	return read(url);
}
