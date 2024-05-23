import { test } from '../../test';

export default test({
	error: {
		code: 'attribute_unquoted_sequence',
		message: 'Invalid attribute expression',
		position: [101, 116]
	}
});
