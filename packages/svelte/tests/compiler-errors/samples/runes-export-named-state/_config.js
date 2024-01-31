import { test } from '../../test';

export default test({
	error: {
		code: 'invalid-state-export',
		message: 'Cannot export state if it is reassigned',
		position: [28, 53]
	}
});
