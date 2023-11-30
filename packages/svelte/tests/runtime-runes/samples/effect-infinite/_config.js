import { test } from '../../test';

export default test({
	runtime_error:
		'ERR_SVELTE_TOO_MANY_UPDATES: Maximum update depth exceeded. This can happen when a reactive block or effect repeatedly sets a new value. Svelte limits the number of nested updates to prevent infinite loops.',
	async test({ assert, target }) {}
});
