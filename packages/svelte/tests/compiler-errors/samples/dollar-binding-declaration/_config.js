import { test } from '../../test';

export default test({
	error: {
		code: 'invalid-dollar-binding',
		message: 'The $ name is reserved, and cannot be used for variables and imports'
	}
});
