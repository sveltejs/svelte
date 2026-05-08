import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();
		const [x, y, resolve, commit] = target.querySelectorAll('button');
		const [p] = target.querySelectorAll('p');

		y.click();
		await tick();
		resolve.click();
		await tick();
		x.click();
		await tick();
		assert.htmlEqual(p.innerHTML, '1 0');

		await tick();
		commit.click();
		assert.htmlEqual(p.innerHTML, '1 1');
	}
});
