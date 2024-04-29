import { test } from '../../test';

export default test({
	error: {
		code: 'css_global_block_invalid_declaration',
		message: 'A :global {...} block can only contain rules, not declarations',
		position: [24, 34]
	}
});
