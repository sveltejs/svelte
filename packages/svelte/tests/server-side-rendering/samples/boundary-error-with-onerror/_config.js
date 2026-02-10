import { test } from '../../test';

export default test({
	// boundary with failed snippet exists, so onerror should transform the error
	onerror: (error) => {
		if (/** @type {Error} */ (error).message !== 'you are not supposed to see this message') {
			return 'wrong object passed to onerror';
		}
		return 'component error';
	}
});
