import { test } from '../../test';

export default test({
	error: {
		code: 'duplicate-prop-name',
		message: 'Cannot use the same prop name more than once across $props() and $props.bindable()',
		position: [44, 50]
	}
});
