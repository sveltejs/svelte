import { test } from '../../test';

export default test({
	error: {
		code: 'css_global_block_invalid_combinator',
		message: 'A `:global` selector cannot follow a `>` combinator',
		position: [54, 63]
	}
});
