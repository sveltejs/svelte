import { test } from '../../test';

export default test({
	error: {
		code: 'invalid-css-global-block-list',
		message: 'A :global {...} block cannot be part of a selector list with more than one item',
		position: [9, 31]
	}
});
