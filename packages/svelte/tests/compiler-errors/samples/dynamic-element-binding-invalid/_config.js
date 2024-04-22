import { test } from '../../test';

export default test({
	error: {
		code: 'bind_invalid_target',
		message: '`bind:value` can only be used with <input>, <textarea>, <select>'
	}
});
