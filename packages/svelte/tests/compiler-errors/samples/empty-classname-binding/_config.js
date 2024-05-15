import { test } from '../../test';

export default test({
	error: {
		code: 'directive_missing_name',
		message: '`class:` name cannot be empty',
		position: [4, 10]
	}
});
