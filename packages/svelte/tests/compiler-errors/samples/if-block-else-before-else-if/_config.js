import { test } from '../../test';

export default test({
	error: {
		code: 'block_duplicate_clause',
		message: '{:else} cannot appear more than once within a block',
		position: [23, 23]
	}
});
