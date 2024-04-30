import { test } from '../../test';

export default test({
	error: {
		code: 'svelte_meta_invalid_content',
		message: '<svelte:window> cannot have children',
		position: [15, 15]
	}
});
