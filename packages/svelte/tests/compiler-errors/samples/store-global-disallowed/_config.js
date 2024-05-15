import { test } from '../../test';

export default test({
	error: {
		code: 'global_reference_invalid',
		message:
			'`$foo` is an illegal variable name. To reference a global variable called `$foo`, use `globalThis.$foo`'
	}
});
