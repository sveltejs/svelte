import { test } from '../../test';

export default test({
	error: {
		code: 'svelte_meta_duplicate',
		message: 'A component can only have one `<svelte:window>` element',
		position: [17, 17]
	}
});
