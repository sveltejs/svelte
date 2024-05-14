import { test } from '../../test';

export default test({
	error: {
		code: 'attribute_invalid_sequence_expression',
		message:
			'Sequence expressions are not allowed as attribute/directive values in runes mode, unless wrapped in parentheses',
		position: [124, 131]
	}
});
