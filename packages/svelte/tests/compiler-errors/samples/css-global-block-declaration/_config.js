import { test } from '../../test';

export default test({
	error: {
		code: 'invalid_css_global_block_declaration',
		message: 'A :global {...} block can only contain rules, not declarations',
		position: [24, 34]
	}
});
