import { test } from '../../test';

export default test({
	error: {
		code: 'invalid-derived-export',
		message: 'Cannot export derived state from a module',
		position: [24, 66]
	}
});
