import { test } from '../../test';

export default test({
	error: {
		code: 'derived_invalid_export',
		message:
			'Cannot export derived state from a module. To expose the current derived value, export a function returning its value',
		position: [70, 76]
	}
});
