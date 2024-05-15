import { test } from '../../test';

export default test({
	error: {
		code: 'js_parse_error',
		message: 'Assigning to rvalue',
		position: [1, 1]
	}
});
