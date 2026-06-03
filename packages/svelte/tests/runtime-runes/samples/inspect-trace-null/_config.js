import { assert } from 'vitest';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	test({ logs }) {
		assert.ok(logs.length > 0);
	}
});
