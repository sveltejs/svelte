import { test } from '../../test';

export default test({
	error: {
		code: 'block_duplicate_clause',
		message: '{:then} cannot appear more than once within a block',
		position: [43, 43]
	}
});
