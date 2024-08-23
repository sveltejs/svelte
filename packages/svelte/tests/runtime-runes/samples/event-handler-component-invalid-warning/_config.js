import { test } from '../../test';

export default test({
	mode: ['client'],

	compileOptions: {
		dev: true
	},

	test({ assert, target, warnings }) {
		target.querySelector('button')?.click();

		assert.deepEqual(warnings, [
			'`click` handler at Button.svelte:5:9 should be a function. Did you mean to add a leading `() =>`?'
		]);
	}
});
