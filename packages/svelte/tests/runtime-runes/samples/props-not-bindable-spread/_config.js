import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},
	error:
		'A component is binding to property count of Counter.svelte (i.e. <Counter bind:count />). This is disallowed because the property was ' +
		'not declared as bindable inside .../samples/props-not-bindable-spread/Counter.svelte. To mark a property as bindable, use the $bindable() rune ' +
		'in Counter.svelte like this: `let { count = $bindable() } = $props()`',
	html: `0`
});
