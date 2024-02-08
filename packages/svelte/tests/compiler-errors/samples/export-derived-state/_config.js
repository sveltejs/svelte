import { test } from '../../test';

export default test({
	error: {
		code: 'invalid-derived-export',
		message:
			'Cannot export derived state. To expose the current derived value, export a function returning its value'
	}
});
