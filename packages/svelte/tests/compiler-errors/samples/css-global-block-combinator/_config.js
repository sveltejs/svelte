import { test } from '../../test';

export default test({
	error: {
		code: 'invalid-css-global-block-combinator',
		message: 'A :global {...} block cannot follow a > combinator',
		position: [12, 21]
	}
});
