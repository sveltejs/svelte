import { test } from '../../test';

export default test({
	error: {
		code: 'css_global_block_invalid_list',
		message: 'A :global {...} block cannot be part of a selector list with more than one item',
		position: [9, 31]
	}
});
