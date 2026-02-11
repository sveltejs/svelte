import { test } from '../../test';

export default test({
	// boundary with failed snippet exists, so handleError should transform the error
	handleError: (error) => {
		if (/** @type {Error} */ (error).message !== 'you are not supposed to see this message') {
			return 'wrong object passed to handleError';
		}
		return 'component error';
	}
});
