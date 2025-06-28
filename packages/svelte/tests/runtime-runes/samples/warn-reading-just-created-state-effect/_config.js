import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},
	async test({ assert, warnings }) {
		console.log(warnings);
		assert.deepEqual(warnings, [
			'The variable `x` is created and read within `$effect`. `$effect` will not depend on it.'
		]);
	}
});
