import { test } from '../../test';

export default test({
	error: {
		code: 'render_tag_invalid_expression',
		message: '`{@render ...}` tags can only contain call expressions',
		position: [34, 37]
	}
});
