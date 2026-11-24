import { test } from '../../test';

export default test({
	compileOptions: {
		css: 'injected'
	},
	html: '<p>a</p><p>b</p><p class="svelte-xyz123">c</p>'
});
