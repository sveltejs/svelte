import { test } from '../../test';

export default test({
	error: {
		code: 'block_invalid_continuation_placement',
		message:
			'{:...} block is invalid at this position (did you forget to close the preceeding element or block?)',
		position: [18, 18]
	}
});
