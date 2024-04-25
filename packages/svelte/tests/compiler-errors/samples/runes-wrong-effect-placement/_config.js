import { test } from '../../test';

export default test({
	error: {
		code: 'effect_invalid_placement',
		message: '`$effect()` can only be used as an expression statement'
	}
});
