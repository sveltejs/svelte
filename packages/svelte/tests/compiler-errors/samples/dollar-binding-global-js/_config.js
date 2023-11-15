import { test } from '../../test';

export default test({
	error: {
		code: 'illegal-global',
		message:
			'$ is an illegal variable name. To reference a global variable called $, use globalThis.$'
	}
});
