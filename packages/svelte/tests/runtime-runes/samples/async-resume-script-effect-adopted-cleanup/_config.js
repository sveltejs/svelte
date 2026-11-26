import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [fork, show, shift, pop, commit, hide] = target.querySelectorAll('button');

		fork.click();
		await tick();
		show.click();
		await tick();

		shift.click();
		await tick();
		assert.deepEqual(logs.splice(0), []);

		pop.click();
		await tick();
		assert.equal(target.querySelector('p')?.textContent, '0 0');
		assert.deepEqual(logs.splice(0), ['effect 0 0', 'created']);

		commit.click();
		await tick();
		assert.equal(target.querySelector('p')?.textContent, '1 1');
		assert.deepEqual(logs.splice(0), ['effect 1 1']);

		hide.click();
		await tick();
		assert.equal(target.querySelector('p'), null);
		assert.deepEqual(logs.splice(0), ['destroyed']);
	}
});
