import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},
	error:
		'Cannot use bind:count on this component because the property was not declared as bindable. ' +
		'To mark a property as bindable, use the $bindable() rune like this: `let { count = $bindable() } = $props()`',
	html: `0`
});
