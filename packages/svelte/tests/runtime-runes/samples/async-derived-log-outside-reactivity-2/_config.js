import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		await tick();
		const [a, b, resolve, read] = target.querySelectorAll('button');
		const [p] = target.querySelectorAll('p');
		assert.htmlEqual(p.innerHTML, '0 0 0');

		// A waits for its async expression, so its updated input is not yet rendered.
		a.click();
		await tick();
		assert.htmlEqual(p.innerHTML, '0 0 0');

		// B commits with A's old input. Its derived values must remain batch-local.
		b.click();
		await tick();
		assert.htmlEqual(p.innerHTML, '0 1 2');

		// Outside reactivity, both deriveds should reflect the real inputs, without
		// changing the DOM until A resolves.
		read.click();
		await tick();
		assert.htmlEqual(p.innerHTML, '0 1 2');

		resolve.click();
		await tick();
		assert.htmlEqual(p.innerHTML, '1 2 4');
		read.click();
		assert.deepEqual(logs, [
			{ a: 1, b: 1, c: 2, doubled: 4 },
			{ a: 1, b: 1, c: 2, doubled: 4 }
		]);
	}
});
