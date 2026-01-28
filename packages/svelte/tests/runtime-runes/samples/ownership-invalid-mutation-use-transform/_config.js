import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},
	async test({ assert, errors }) {
		assert.deepEqual(errors, []);
	}
});
