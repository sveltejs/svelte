import { test } from '../../test';

export default test({
	error: {
		code: 'invalid-bindable-location',
		message: '$bindable() can only be used inside a $props() declaration'
	}
});
