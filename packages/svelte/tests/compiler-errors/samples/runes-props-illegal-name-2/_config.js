import { test } from '../../test';

export default test({
	error: {
		code: 'props_illegal_name',
		message:
			'Declaring or accessing a property starting with `$$` is illegal (they are reserved for Svelte internals)'
	}
});
