import { test } from '../../test';

export default test({
	server_props: {
		browser: false
	},
	props: {
		browser: true
	},
	compileOptions: {
		dev: true
	},
	async test({ warnings, assert }) {
		assert.deepEqual(warnings, []);
	}
});
