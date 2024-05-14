import { test } from '../../test';

export default test({
	error: {
		code: 'props_duplicate',
		message: 'Cannot use `$props()` more than once'
	}
});
