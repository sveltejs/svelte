import { test } from '../../test';

export default test({
	error: {
		code: 'unclosed-style',
		message: '<style> must have a closing tag',
		position: [31, 31]
	}
});
