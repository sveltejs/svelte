import { test } from '../../test';

export default test({
	error: {
		code: 'invalid-state-location',
		message:
			'$state() can only be used as a variable declaration initializer, a class field or if passed an object or array, can be used as an expression',
		position: [81, 90]
	}
});
