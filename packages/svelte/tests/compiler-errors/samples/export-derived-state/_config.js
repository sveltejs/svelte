import { test } from '../../test';

export default test({
	error: {
		code: 'invalid_derived_export',
		message:
			'Cannot export derived state from a module. To expose the current derived value, export a function returning its value',
		position: [24, 66]
	}
});
