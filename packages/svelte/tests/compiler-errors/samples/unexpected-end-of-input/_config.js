import { test } from '../../test';

export default test({
	error: {
		code: 'unclosed_element',
		message: '`<div>` was left open',
		position: [0, 1]
	}
});
