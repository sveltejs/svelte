import { test } from '../../test';

export default test({
	error: {
		code: 'block_invalid_elseif',
		message: "'elseif' should be 'else if'",
		position: [34, 34]
	}
});
