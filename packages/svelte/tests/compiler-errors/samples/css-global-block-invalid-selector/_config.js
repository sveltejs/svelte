import { test } from '../../test';

export default test({
	error: {
		code: 'css_global_block_invalid_placement',
		message:
			'A :global {...} block can only appear at the end of a selector sequence (did you mean to use :global(...) instead?)',
		position: [50, 57]
	}
});
