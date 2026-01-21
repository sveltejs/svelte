import { test } from '../../test';

export default test({
	mode: ['async'],
	compileOptions: {
		dev: true
	},
	error: 'svelte_element_invalid_this_value'
});
