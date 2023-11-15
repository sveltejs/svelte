import { test } from '../../test';

export default test({
	error: {
		code: 'invalid-effect-location',
		message: '$effect() can only be used as an expression statement'
	}
});
