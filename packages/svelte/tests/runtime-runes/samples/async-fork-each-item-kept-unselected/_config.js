import { tick } from 'svelte';
import { test } from '../../test';

// A fork creates item 2 (offscreen). A real batch commits a list without it, which keeps the item offscreen
// for the fork. The fork takes over the committed list, so it doesn't select the item anymore either. Once
// the fork is committed, the item must be destroyed, rather than linger (paused) until a batch reuses it
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [fork, without_2, commit, with_2] = target.querySelectorAll('button');
		const main = /** @type {HTMLElement} */ (target.querySelector('main'));
		logs.length = 0;

		fork.click();
		await tick();
		assert.htmlEqual(main.innerHTML, '<p>0a</p><p>1a</p>');
		assert.deepEqual(logs.splice(0), ['create 2']);

		without_2.click();
		await tick();
		assert.htmlEqual(main.innerHTML, '<p>0a</p><p>1a</p><p>5a</p>');
		assert.deepEqual(logs.splice(0), ['create 5']);

		commit.click();
		await tick();
		assert.htmlEqual(main.innerHTML, '<p>0b</p><p>1b</p><p>5b</p>');

		with_2.click();
		await tick();
		assert.htmlEqual(main.innerHTML, '<p>0b</p><p>1b</p><p>2b</p>');
		assert.deepEqual(logs.splice(0), ['create 2']);
	}
});
