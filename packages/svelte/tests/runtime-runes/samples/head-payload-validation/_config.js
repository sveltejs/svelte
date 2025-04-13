import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},
	mode: ['server'],
	async test({ errors, assert }) {
		assert.equal(errors, []);
	}
});
