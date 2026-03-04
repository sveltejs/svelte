import { test } from '../../test';

export default test({
	error: {
		code: 'each_key_without_as',
		message: 'An `{#each ...}` block without an `as` clause cannot have a key'
	}
});
