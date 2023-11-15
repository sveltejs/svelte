import { test } from '../../test';

export default test({
	error: {
		code: 'invalid-derived-location',
		message: '$derived() can only be used as a variable declaration initializer or a class field'
	}
});
