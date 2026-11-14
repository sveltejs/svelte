import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [create, commit] = target.querySelectorAll('button');
		const [p] = target.querySelectorAll('p');

		create.click();
		await tick();
		assert.htmlEqual(p.innerHTML, '0:0');

		commit.click();
		await tick();
		assert.htmlEqual(p.innerHTML, '0:0');
	}
});
