import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	async test({ assert, target, warnings }) {
		const [btn1, btn2] = target.querySelectorAll('button');

		btn1.click();
		await tick();

		assert.deepEqual(warnings.length, 0);

		btn2.click();
		await tick();

		assert.deepEqual(warnings.length, 1);
	}
});
