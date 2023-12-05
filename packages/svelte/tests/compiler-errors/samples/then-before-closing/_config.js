import { test } from '../../test';

export default test({
	error: {
		code: 'invalid-continuing-block-placement',
		message:
			'{:...} block is invalid at this position (did you forget to close the preceeding element or block?)',
		position: [21, 21]
	}
});
