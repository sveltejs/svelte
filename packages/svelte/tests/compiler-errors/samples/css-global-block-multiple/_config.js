import { test } from '../../test';

export default test({
	error: {
		code: 'invalid_css_global_block_list',
		message: 'A :global {...} block cannot be part of a selector list with more than one item',
		position: [9, 31]
	}
});
