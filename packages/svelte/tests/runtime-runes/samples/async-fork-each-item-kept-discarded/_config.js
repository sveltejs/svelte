import { tick } from 'svelte';
import { test } from '../../test';

// A fork creates item 2 (offscreen). A real batch commits a list without it, which keeps the item offscreen
// for the fork. Once the fork is discarded, nothing selects the item anymore, so it must be destroyed: else
// a later batch reuses it, with the content it got in the discarded fork's view (`label = 'b'`)
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [fork, without_2, discard, with_2] = target.querySelectorAll('button');
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

		discard.click();
		await tick();
		assert.htmlEqual(main.innerHTML, '<p>0a</p><p>1a</p><p>5a</p>');

		with_2.click();
		await tick();
		assert.htmlEqual(main.innerHTML, '<p>0a</p><p>1a</p><p>2a</p>');
		assert.deepEqual(logs.splice(0), ['create 2']);
	}
});
