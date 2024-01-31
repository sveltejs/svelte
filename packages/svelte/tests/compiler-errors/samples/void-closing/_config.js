import { test } from '../../test';

export default test({
	error: {
		code: 'invalid-void-content',
		message: 'Void elements cannot have children or closing tags',
		position: [23, 23]
	}
});
