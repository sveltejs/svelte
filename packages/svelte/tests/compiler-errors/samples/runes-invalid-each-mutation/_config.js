import { test } from '../../test';

export default test({
	error: {
		code: 'invalid-each-mutation',
		message: 'Cannot mutate each block reference directly in runes mode'
	}
});
