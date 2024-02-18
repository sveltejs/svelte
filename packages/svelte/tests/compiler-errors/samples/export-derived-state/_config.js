import { test } from '../../test';

export default test({
	error: {
		code: 'invalid-derived-export',
		message: 'Cannot export derived state',
		position: [24, 66]
	}
});
