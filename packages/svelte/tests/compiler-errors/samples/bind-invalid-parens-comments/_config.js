import { test } from '../../test';

export default test({
	error: {
		code: 'bind_invalid_parens',
		message: '`bind:value={get, set}` must not have surrounding parentheses',
		position: [52, 115]
	}
});
