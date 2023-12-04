import { test } from '../../test';

export default test({
	error: {
		code: 'css-syntax-error',
		message: ':global() must contain a selector',
		position: [9, 9]
	}
});
