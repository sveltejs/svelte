import { test } from '../../test';

export default test({
	error: {
		code: 'invalid_rune_args_length',
		message: '`$state.snapshot` must be called with exactly one argument'
	}
});
