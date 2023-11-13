import { test } from '../../test';

export default test({
	error: {
		code: 'invalid-void-content',
		message: '<input> is a void element and cannot have children, or a closing tag',
		position: [23, 23]
	}
});
