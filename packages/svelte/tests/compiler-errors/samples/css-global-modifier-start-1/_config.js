import { test } from '../../test';

export default test({
	error: {
		code: 'css_global_block_invalid_modifier_start',
		message: 'A `:global` selector can only be modified if it is a descendant of other selectors',
		position: [75, 77]
	}
});
