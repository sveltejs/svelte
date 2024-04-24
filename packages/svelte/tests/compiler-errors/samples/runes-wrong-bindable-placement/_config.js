import { test } from '../../test';

export default test({
	error: {
		code: 'invalid_bindable_location',
		message: '`$bindable()` can only be used inside a `$props()` declaration'
	}
});
