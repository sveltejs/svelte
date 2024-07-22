import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	skip_mode: ['hydrate'],

	warnings: [
		'The `render` function of `createRawSnippet` is expected to return the HTML for a single element. Ensure the HTML generated from `render` is correct.'
	]
});
