import { test } from '../../test';

export default test({
	mode: ['client'],
	compileOptions: {
		dev: true
	},
	async test({ warnings, assert }) {
		assert.deepEqual(warnings, []);
	}
});
