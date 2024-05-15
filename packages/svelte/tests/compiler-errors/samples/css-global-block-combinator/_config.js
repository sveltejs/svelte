import { test } from '../../test';

export default test({
	error: {
		code: 'css_global_block_invalid_combinator',
		message: 'A :global {...} block cannot follow a > combinator',
		position: [12, 21]
	}
});
