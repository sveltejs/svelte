import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true // to ensure we we catch the error
	},
	error:
		'bind_invalid_export\n' +
		'Component .../export-binding/counter/index.svelte has an export named `increment` that a consumer component is trying to access using `bind:increment`, which is disallowed. Instead, use `bind:this` (e.g. `<Counter bind:this={component} />`) and then access the property on the bound component instance (e.g. `component.increment`)'
});
