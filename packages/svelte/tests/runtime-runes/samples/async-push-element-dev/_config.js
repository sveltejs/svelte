import { test } from '../../test';

export default test({
	mode: ['async-server'],

	compileOptions: {
		// include `push_element` calls, so that we can check they
		// run with the correct ssr_context
		dev: true
	},

	html: `
		<h1>hello!</h1>
	`
});
