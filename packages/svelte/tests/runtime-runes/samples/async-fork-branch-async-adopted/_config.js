import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, target }) {
		const [fork_a, fork_b, resolve_one, resolve_all, discard_a, commit_b] =
			target.querySelectorAll('button');
		const [output] = target.querySelectorAll('main');

		fork_a.click();
		await tick();
		resolve_one.click();
		await tick();
		fork_b.click();
		await tick();
		resolve_one.click();
		await tick();
		discard_a.click();
		await tick();
		resolve_one.click();
		await tick();
		commit_b.click();
		await tick();

		for (let i = 0; i < 5; i++) {
			resolve_all.click();
			await tick();
		}

		assert.htmlEqual(output.innerHTML, '<section>s</section>');
	}
});
