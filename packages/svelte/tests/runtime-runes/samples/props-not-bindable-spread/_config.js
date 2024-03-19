import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},
	error:
		'Cannot use bind:count on this component because the property was not declared as bindable. To mark a property as bindable, use let `{ count } = $props.bindable()` within the component.',
	html: `0`
});
