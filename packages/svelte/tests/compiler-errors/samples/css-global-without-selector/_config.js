import { test } from '../../test';

export default test({
	error: {
		code: 'invalid-css-global-selector',
		message: ':global(...) must contain exactly one selector',
		position: [16, 16]
	}
});
