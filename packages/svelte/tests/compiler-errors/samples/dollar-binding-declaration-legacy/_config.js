import { test } from '../../test';

export default test({
	error: {
		code: 'dollar_binding_invalid',
		message: 'The $ name is reserved, and cannot be used for variables and imports',
		position: [108, 109]
	}
});
