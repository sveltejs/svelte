import { test } from '../../test';

export default test({
	mode: ['client'],

	compileOptions: {
		dev: true
	},

	error:
		'svelte_component_invalid_this_value\nThe `this={...}` property of a `<svelte:component>` must be a Svelte component, if defined'
});
