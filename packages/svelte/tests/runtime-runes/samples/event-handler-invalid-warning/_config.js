import { test } from '../../test';

export default test({
	mode: ['client'],

	compileOptions: {
		dev: true
	},

	test({ assert, target, warnings }) {
		target.querySelector('button')?.click();

		assert.deepEqual(warnings, [
			'`click` handler at main.svelte:9:17 should be a function. Did you mean to remove the trailing `()`?'
		]);
	}
});
