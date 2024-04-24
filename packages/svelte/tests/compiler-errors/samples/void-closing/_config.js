import { test } from '../../test';

export default test({
	error: {
		code: 'invalid_void_content',
		message: 'Void elements cannot have children or closing tags',
		position: [23, 23]
	}
});
