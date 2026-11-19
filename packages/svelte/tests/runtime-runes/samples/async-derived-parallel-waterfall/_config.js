import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	compileOptions: {
		dev: true
	},
	async test({ assert, target, warnings }) {
		const [a, b, c] = target.querySelectorAll('button');
		await tick();

		// `b` can only be read once `a` and `c` are there, too, but that's not a waterfall,
		// as it was loaded in parallel with them
		b.click();
		await new Promise((r) => setTimeout(r, 10));
		assert.deepEqual(warnings, []);

		a.click();
		await new Promise((r) => setTimeout(r, 10));
		assert.deepEqual(warnings, []);

		c.click();
		await new Promise((r) => setTimeout(r, 10));

		const [output] = target.querySelectorAll('output');
		assert.htmlEqual(output.innerHTML, 'a b c');
		assert.deepEqual(warnings, []);
	}
});
