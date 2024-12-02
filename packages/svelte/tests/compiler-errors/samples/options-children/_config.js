import { test } from '../../test';

export default test({
	error: {
		code: 'svelte_meta_invalid_content',
		message: '<svelte:options> cannot have children',
		position: [16, 24]
	}
});
