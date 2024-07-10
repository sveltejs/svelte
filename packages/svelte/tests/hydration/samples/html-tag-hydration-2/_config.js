import { test } from '../../test';

export default test({
	server_props: {
		browser: false
	},

	props: {
		browser: true
	},

	compileOptions: {
		dev: true
	},

	errors: [
		'The value of an `{@html ...}` block in packages/​svelte/​tests/​hydration/​samples/​html-tag-hydration-2/​main.svelte changed between server and client renders. The client value will be ignored in favour of the server value'
	]
});
