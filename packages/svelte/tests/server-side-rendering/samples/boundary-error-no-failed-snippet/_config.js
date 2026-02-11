import { test } from '../../test';

export default test({
	// handleError handles the error, but there's no failed snippet.
	// The error should still propagate because there's nothing to render instead.
	handleError: () => 'you will not see me',
	error: 'component error'
});
