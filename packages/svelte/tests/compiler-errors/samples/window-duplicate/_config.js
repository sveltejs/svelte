import { test } from '../../test';

export default test({
	error: {
		code: 'duplicate-window',
		message: 'A component can only have one <svelte:window> tag',
		position: [17, 17]
	}
});
