import { test } from '../../test';

export default test({
	error: {
		code: 'invalid-css-identifier',
		message: ':global() must contain a selector',
		position: [9, 9]
	}
});
