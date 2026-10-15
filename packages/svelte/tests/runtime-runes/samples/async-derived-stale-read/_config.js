import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		await tick();

		const [a, b, log, resolve] = target.querySelectorAll('button');

		a.click();
		await tick();
		b.click();
		await tick();
		resolve.click();
		await tick();
		assert.htmlEqual(target.querySelector('p')?.innerHTML ?? '', 'd is 1');

		resolve.click();
		await tick();
		assert.equal(target.querySelector('p'), null);
	}
});
