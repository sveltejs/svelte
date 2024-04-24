import { test } from '../../test';

export default test({
	error: {
		code: 'invalid_state_location',
		message: '`$state(...)` can only be used as a variable declaration initializer or a class field'
	}
});
