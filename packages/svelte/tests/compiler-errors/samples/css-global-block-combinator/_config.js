import { test } from '../../test';

export default test({
	error: {
		code: 'invalid_css_global_block_combinator',
		message: 'A :global {...} block cannot follow a > combinator',
		position: [12, 21]
	}
});
