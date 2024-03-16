import { test } from '../../test';

export default test({
	error: {
		code: 'invalid-render-call',
		message: 'Calling a snippet function using apply, bind or call is not allowed'
	}
});
