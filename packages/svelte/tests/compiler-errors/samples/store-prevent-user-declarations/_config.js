import { test } from '../../test';

export default test({
	skip: true,
	error: {
		code: '',
		message: 'The $ prefix is reserved, and cannot be used for variable and import names'
	}
});
