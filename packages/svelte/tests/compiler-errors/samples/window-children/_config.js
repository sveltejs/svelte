import { test } from '../../test';

export default test({
	error: {
		code: 'invalid_element_content',
		message: '<svelte:window> cannot have children',
		position: [15, 15]
	}
});
