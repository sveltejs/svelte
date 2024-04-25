import { test } from '../../test';

export default test({
	error: {
		code: 'render_tag_invalid_call_expression',
		message: 'Calling a snippet function using apply, bind or call is not allowed'
	}
});
