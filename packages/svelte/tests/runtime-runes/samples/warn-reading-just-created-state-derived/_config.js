import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},
	async test({ assert, warnings }) {
		console.log(warnings);
		assert.deepEqual(warnings, [
			'The variable `count` is created and read within `derived_count`. `derived_count` will not depend on it.'
		]);
	}
});
