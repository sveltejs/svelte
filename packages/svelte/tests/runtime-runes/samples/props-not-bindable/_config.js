import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	html: '0',

	error:
		'bind_not_bindable\n' +
		'A component is attempting to bind to a non-bindable property `count` belonging to .../samples/props-not-bindable/Counter.svelte (i.e. `<Counter bind:count={...}>`). To mark a property as bindable: `let { count = $bindable() } = $props()`'
});
