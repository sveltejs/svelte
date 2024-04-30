import { test } from '../../test';

export default test({
	error: {
		code: 'rune_invalid_arguments_length',
		message: '`$state.snapshot` must be called with exactly one argument'
	}
});
