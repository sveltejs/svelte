import { test } from '../../test';

export default test({
	error: {
		code: 'constant_assignment',
		message: 'Cannot assign to `constant`. If the variable needs to be reassigned, declare it with `let` or use `$state()` for reactive state'
	}
});
