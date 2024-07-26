import { test } from '../../test';

export default test({
	error: {
		code: 'css_global_block_invalid_modifier',
		message: 'A `:global` selector cannot modify an existing selector',
		position: [70, 77]
	}
});
