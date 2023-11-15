import { test } from '../../test';

export default test({
	error: {
		code: 'duplicate-props-rune',
		message: 'Cannot use $props() more than once'
	}
});
