import { test } from '../../test';

export default test({
	error: {
		code: 'state_invalid_export',
		message:
			"Cannot export state from a module if it is reassigned. Either export a function returning the state value or only mutate the state value's properties",
		position: [66, 104]
	}
});
