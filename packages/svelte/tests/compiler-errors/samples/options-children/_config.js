import { test } from '../../test';

export default test({
	error: {
		code: 'invalid_element_content',
		message: '<svelte:options> cannot have children',
		position: [16, 16]
	}
});
