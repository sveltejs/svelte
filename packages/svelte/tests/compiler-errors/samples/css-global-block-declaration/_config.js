import { test } from '../../test';

export default test({
	error: {
		code: 'invalid-css-global-block-declaration',
		message: 'A :global {...} block can only contain rules, not declarations',
		position: [24, 34]
	}
});
