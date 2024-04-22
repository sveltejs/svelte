import { test } from '../../test';

export default test({
	error: {
		code: 'duplicate_svelte_element',
		message: 'A component can only have one <svelte:window> element',
		position: [17, 17]
	}
});
