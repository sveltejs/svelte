import { test } from '../../test';

export default test({
	error: {
		code: 'css_global_block_invalid_placement',
		message: 'A `:global` selector cannot be inside a pseudoclass',
		position: [28, 35]
	}
});
