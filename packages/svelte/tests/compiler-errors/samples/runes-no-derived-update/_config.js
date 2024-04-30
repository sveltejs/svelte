import { test } from '../../test';

export default test({
	error: {
		code: 'constant_assignment',
		message: 'Cannot assign to derived state'
	}
});
