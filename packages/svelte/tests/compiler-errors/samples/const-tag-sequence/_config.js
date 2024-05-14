import { test } from '../../test';

export default test({
	error: {
		code: 'const_tag_invalid_expression',
		message: '{@const ...} must consist of a single variable declaration',
		position: [75, 93]
	}
});
