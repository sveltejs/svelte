import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [fork, commit] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('#output');

		fork.click();
		await tick();

		commit.click();
		await tick();

		assert.htmlEqual(output.innerHTML, '<p>failed</p>');
	}
});
