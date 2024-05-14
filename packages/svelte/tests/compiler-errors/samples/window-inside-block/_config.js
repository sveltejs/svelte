import { test } from '../../test';

export default test({
	error: {
		code: 'svelte_meta_invalid_placement',
		message: '`<svelte:window>` tags cannot be inside elements or blocks',
		position: [11, 11]
	}
});
