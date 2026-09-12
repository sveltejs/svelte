import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	compileOptions: {
		dev: true
	},

	async test({ assert, target, errors }) {
		await new Promise((resolve) => setTimeout(resolve, 20));
		await tick();

		assert.deepEqual(
			errors.filter((error) => error.includes('state_unsafe_mutation')),
			[]
		);
		assert.htmlEqual(target.innerHTML, '<p>pending</p><p>1</p>');
	}
});
