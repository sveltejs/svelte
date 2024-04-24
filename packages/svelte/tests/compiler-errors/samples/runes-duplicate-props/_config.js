import { test } from '../../test';

export default test({
	error: {
		code: 'duplicate_props_rune',
		message: 'Cannot use `$props()` more than once'
	}
});
