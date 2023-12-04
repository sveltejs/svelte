import { test } from '../../test';

export default test({
	error: {
		code: 'invalid-window-placement',
		message: '<svelte:window> tags cannot be inside elements or blocks',
		position: [11, 11]
	}
});
