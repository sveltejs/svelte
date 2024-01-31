import { test } from '../../test';

export default test({
	error: {
		code: 'unclosed-element',
		message: '<script> was left open',
		position: [32, 32]
	}
});
