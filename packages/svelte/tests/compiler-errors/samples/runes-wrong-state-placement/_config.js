import { test } from '../../test';

export default test({
	error: {
		code: 'invalid-state-location',
		message: '$state() can only be used as a variable declaration initializer, a class field or a return statement if passed an object or array'
	}
});
