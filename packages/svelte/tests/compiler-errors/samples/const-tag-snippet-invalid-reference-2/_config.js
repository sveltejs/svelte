import { test } from '../../test';

export default test({
	async: true,
	error: {
		code: 'const_tag_invalid_reference',
		message: 'The `{@const foo = ...}` declaration is not available in this snippet',
		position: [298, 301]
	}
});
