import { test } from '../../test';

export default test({
	error: {
		code: 'parse-error',
		message: 'Assigning to rvalue',
		position: [1, 1]
	}
});
