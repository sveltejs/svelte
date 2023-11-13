import { test } from '../../test';

export default test({
	error: {
		code: 'invalid-closing-tag',
		message: '</p> attempted to close <p> that was already automatically closed by <pre>',
		position: [24, 24]
	}
});
