import { test } from '../../test';

export default test({
	error: {
		code: 'import_svelte_internal_forbidden',
		message:
			"Imports of `svelte/internal/*` are forbidden. It contains private runtime code which is subject to change without notice. If you're importing from `svelte/internal/*` to work around a limitation of Svelte, please open an issue at https://github.com/sveltejs/svelte and explain your use case"
	}
});
