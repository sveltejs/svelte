import { test } from '../../test';

export default test({
	error: {
		code: 'invalid-css-global-block-modifier',
		message: 'A :global {...} block cannot modify an existing selector',
		position: [14, 21]
	}
});
