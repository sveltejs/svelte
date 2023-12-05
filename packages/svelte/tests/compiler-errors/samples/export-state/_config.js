import { test } from '../../test';

export default test({
	error: {
		code: 'invalid-state-export',
		message: 'Cannot export state if it is reassigned',
		position: process.platform === 'win32' ? [50, 90] : [46, 86]
	}
});
