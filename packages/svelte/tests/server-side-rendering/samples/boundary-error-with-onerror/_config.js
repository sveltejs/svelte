import { test } from '../../test';

export default test({
	// boundary with failed snippet exists, so transformError should transform the error
	transformError: (error) => {
		if (/** @type {Error} */ (error).message !== 'you are not supposed to see this message') {
			return 'wrong object passed to transformError';
		}
		return 'component error';
	}
});
