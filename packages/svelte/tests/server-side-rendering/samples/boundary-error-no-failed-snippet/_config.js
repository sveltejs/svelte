import { test } from '../../test';

export default test({
	// transformError transforms the error, but there's no failed snippet.
	// The error should still propagate because there's nothing to render instead.
	transformError: () => 'you will not see me',
	error: 'component error'
});
