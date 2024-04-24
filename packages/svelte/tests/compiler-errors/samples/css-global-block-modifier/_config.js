import { test } from '../../test';

export default test({
	error: {
		code: 'invalid_css_global_block_modifier',
		message: 'A :global {...} block cannot modify an existing selector',
		position: [14, 21]
	}
});
