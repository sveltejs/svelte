import { test } from '../../test';

export default test({
	error: {
		code: 'invalid-prop-export',
		message:
			'Cannot export properties. To expose the current value of a property, export a function returning its value'
	}
});
