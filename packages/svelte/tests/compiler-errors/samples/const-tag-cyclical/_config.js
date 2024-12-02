import { test } from '../../test';

export default test({
	error: {
		code: 'const_tag_cycle',
		message: 'Cyclical dependency detected: a → b → a',
		position: [12, 26]
	}
});
