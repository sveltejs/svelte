import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	async test({ assert, target, warnings }) {
		const [btn1, btn2] = target.querySelectorAll('button');

		await btn1.click();
		await tick();
		assert.deepEqual(warnings.length, 0);

		await btn2.click();
		await tick();
		assert.deepEqual(warnings.length, 1);
	}
});
