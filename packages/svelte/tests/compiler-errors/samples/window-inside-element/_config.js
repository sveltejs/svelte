import { test } from '../../test';

export default test({
	error: {
		code: 'invalid_svelte_element_placement',
		message: '<svelte:window> tags cannot be inside elements or blocks',
		position: [7, 7]
	}
});
