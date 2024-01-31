import { test } from '../../test';

export default test({
	error: {
		code: 'js-parse-error',
		message: 'Assigning to rvalue',
		position: [1, 1]
	}
});
