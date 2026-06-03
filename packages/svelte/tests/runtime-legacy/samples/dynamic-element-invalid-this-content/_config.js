import { test } from '../../test';

export default test({
	mode: ['client', 'server'],

	compileOptions: {
		dev: true
	},

	get props() {
		return { tag: true };
	},

	error:
		'svelte_element_invalid_this_value\n' +
		'The `this` prop on `<svelte:element>` must be a string, if defined'
});
