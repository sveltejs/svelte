import { test } from '../../test';

export default test({
	error:
		'ERR_SVELTE_NOT_BINDABLE: Cannot bind:count because the property was not declared as bindable. To mark a property as bindable, use let `{ count } = $props.bindable()` within the component.',
	html: `0`
});
