import { test } from '../../test';

export default test({
	error: {
		code: 'css_global_block_invalid_modifier',
		message: 'A :global {...} block cannot modify an existing selector',
		position: [14, 21]
	}
});
