import { test } from '../../test';

export default test({
	error: {
		code: 'css_global_block_invalid_placement',
		message: ':global at the start of a selector cannot have modifiers',
		position: [81, 90]
	}
});
