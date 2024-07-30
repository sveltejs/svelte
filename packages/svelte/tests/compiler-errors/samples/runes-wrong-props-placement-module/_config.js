import { test } from '../../test';

export default test({
	error: {
		code: 'props_invalid_placement',
		message:
			'`$props()` can only be used at the top level of components as a variable declaration initializer'
	}
});
