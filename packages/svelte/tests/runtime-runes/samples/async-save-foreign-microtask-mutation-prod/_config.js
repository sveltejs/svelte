import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],

	compileOptions: {
		dev: false
	},

	async test({ assert, target, errors }) {
		await tick();
		await tick();
		await tick();

		assert.deepEqual(
			errors.filter((error) => error.includes('state_unsafe_mutation')),
			[]
		);
		assert.htmlEqual(target.innerHTML, '<p>4 1</p>');
	}
});
