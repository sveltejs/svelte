import { test } from '../../test';

export default test({
	error: {
		code: 'invalid-props-mutation',
		message:
			'Properties defined by $props() cannot be mutated. Use $props.bindable() instead, or make a copy of the value and reassign it.'
	}
});
