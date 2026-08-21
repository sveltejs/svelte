import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	async test({ assert, target, warnings }) {
		await new Promise((r) => setTimeout(r, 5));

		const [count] = target.querySelectorAll('button');

		count.click();
		await tick();

		assert.equal(warnings.length, 0);
	}
});
