import { test } from '../../test';

export default test({
	// No onerror - by default the server throws, so the error should propagate.
	error: 'component error'
});
