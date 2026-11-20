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

		// `a` is done, but can't be read until `b` (which only starts loading now) is done, too
		a.click();
		await new Promise((r) => setTimeout(r, 10));
		assert.deepEqual(warnings, [
			'An async derived, `a` (Child.svelte:4:11) was not read immediately after it resolved. This often indicates an unnecessary waterfall, which can slow down your app'
		]);

		b.click();
		await new Promise((r) => setTimeout(r, 10));

		const [output] = target.querySelectorAll('output');
		assert.htmlEqual(output.innerHTML, 'a b');
		assert.equal(warnings.length, 1);
	}
});
