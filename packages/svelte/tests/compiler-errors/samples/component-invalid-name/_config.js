import { test } from '../../test';

export default test({
	error: {
		code: 'component_invalid_name',
		message: 'Component name must be a valid variable name or dot notation expression',
		position: [1, 14]
	}
});
