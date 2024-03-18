import { test } from '../../test';

export default test({
	error: {
		code: 'invalid-props-rest-element',
		message: 'Cannot use ...rest parameter with $props.bindable()',
		position: [53, 62]
	}
});
