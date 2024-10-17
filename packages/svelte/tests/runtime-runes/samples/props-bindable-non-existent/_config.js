import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	warnings: [
		'A component is attempting to bind to a non-existent property `content` belonging to Input.svelte (i.e. `<Input bind:content={...}>`)'
	]
});
