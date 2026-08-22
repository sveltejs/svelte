import { test } from '../../test';

export default test({
	error: {
		code: 'js_parse_error',
		message: 'Unexpected token (did you forget to add `lang="ts"`?)',
		position: [18, 18]
	}
});
