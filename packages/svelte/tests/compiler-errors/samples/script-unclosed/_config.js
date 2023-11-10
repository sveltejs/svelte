import { test } from '../../test';

export default test({
	error: {
		code: 'unclosed-script',
		message: '<script> must have a closing tag',
		position: [32, 32]
	}
});
