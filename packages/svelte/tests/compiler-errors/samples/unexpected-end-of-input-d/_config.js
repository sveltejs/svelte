import { test } from '../../test';

export default test({
	error: {
		code: 'unclosed_block',
		message: 'Block was left open',
		position: [0, 1]
	}
});
