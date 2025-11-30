import { test } from '../../test';

export default test({
	error: {
		code: 'props_id_invalid_placement',
		message:
			'`$props.id()` can only be used at the top level of components as a variable declaration initializer, and before any `await` expression.'
	},
	async: true
});
