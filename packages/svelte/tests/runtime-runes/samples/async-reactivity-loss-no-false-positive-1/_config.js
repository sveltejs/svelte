import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	async test({ assert, target, warnings }) {
		await tick();

		const [x, y] = target.querySelectorAll('button');

		y.click();
		await tick();
		x.click();
		await new Promise((r) => setTimeout(r, 15));

		assert.equal(warnings.length, 0);
	}
});
