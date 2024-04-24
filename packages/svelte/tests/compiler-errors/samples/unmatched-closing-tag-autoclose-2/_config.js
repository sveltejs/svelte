import { test } from '../../test';

export default test({
	error: {
		code: 'element_invalid_closing_tag',
		message: '`</p>` attempted to close an element that was not open',
		position: [38, 38]
	}
});
