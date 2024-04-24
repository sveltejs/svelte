import { test } from '../../test';

export default test({
	error: {
		code: 'illegal_global',
		message:
			'`$` is an illegal variable name. To reference a global variable called `$`, use `globalThis.$`'
	}
});
