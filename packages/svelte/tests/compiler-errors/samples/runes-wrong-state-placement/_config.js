import { test } from '../../test';

export default test({
	error: {
		code: 'invalid-state-location',
		message: '$state(...) can only be used as a variable declaration initializer or a class field'
	}
});
