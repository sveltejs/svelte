import { test } from '../../test';

export default test({
	error: {
		code: 'invalid-binding',
		message: "'value' binding can only be used with <input>, <textarea>, <select>"
	}
});
