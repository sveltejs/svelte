import { test } from '../../test';

export default test({
	error: {
		code: 'state_invalid_placement',
		message:
			'`$derived(...)` can only be used as a variable declaration initializer or a class field'
	}
});
