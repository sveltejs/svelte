import { test } from '../../test';

export default test({
	error: {
		code: 'css_global_block_invalid_modifier_start',
		message: 'A :global {...} block at the very beginning cannot be modified by other selectors',
		position: [147, 148]
	}
});
