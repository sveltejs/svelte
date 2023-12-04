import { test } from '../../test';

export default test({
	error: {
		code: 'invalid-derived-export',
		message: 'Cannot export derived state',
		position: process.platform === 'win32' ? [26, 68] : [24, 66]
	}
});
