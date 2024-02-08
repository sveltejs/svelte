import { test } from '../../test';

export default test({
	error: {
		code: 'invalid-each-mutation',
		message: 'Cannot mutate each block references directly in runes mode'
	}
});
