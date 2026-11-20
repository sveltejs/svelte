import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	compileOptions: {
		dev: true
	},
	async test({ assert, target, warnings }) {
		const [a, b] = target.querySelectorAll('button');
		await tick();

		// `b` can only be read once `a` is there, too, but that's not a waterfall,
		// as they were loaded in parallel
		b.click();
		await new Promise((r) => setTimeout(r, 10));
		assert.deepEqual(warnings, []);

		a.click();
		await new Promise((r) => setTimeout(r, 10));

		const [output] = target.querySelectorAll('output');
		assert.htmlEqual(output.innerHTML, 'a b');
		assert.deepEqual(warnings, []);
	}
});
