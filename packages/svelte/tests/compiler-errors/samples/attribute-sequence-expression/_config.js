import { test } from '../../test';

export default test({
	error: {
		code: 'invalid-sequence-expression',
		message:
			'Sequence expressions are not allowed as attribute/directive values in runes mode, unless wrapped in parentheses',
		position: [163, 170]
	}
});
