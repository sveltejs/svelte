import { test } from '../../test';

export default test({
	error: {
		code: 'bindable_invalid_location',
		message: '`$bindable()` can only be used inside a `$props()` declaration'
	}
});
