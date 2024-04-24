import { test } from '../../test';

export default test({
	error: {
		code: 'empty_directive_name',
		message: 'ClassDirective name cannot be empty',
		position: [10, 10]
	}
});
