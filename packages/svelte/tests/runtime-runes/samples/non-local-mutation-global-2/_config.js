import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	async test({ assert, warnings }) {
		assert.deepEqual(warnings, []);
	}
});
