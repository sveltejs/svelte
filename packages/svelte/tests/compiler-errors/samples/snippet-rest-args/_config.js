import { test } from '../../test';

export default test({
	error: {
		code: 'snippet_invalid_rest_parameter',
		message: 'Snippets do not support rest parameters; use an array instead',
		position: [19, 26]
	}
});
