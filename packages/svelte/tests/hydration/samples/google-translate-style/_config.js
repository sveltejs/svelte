import { test } from '../../test';

// Simulates Google Translate (and similar browser translation tools) wrapping
// text content in <font> elements, which was causing hydration to fail and
// blank the page. See https://github.com/sveltejs/svelte/issues/14807
export default test({
	props: {
		name: 'world'
	},

	expect_hydration_error: true
});
