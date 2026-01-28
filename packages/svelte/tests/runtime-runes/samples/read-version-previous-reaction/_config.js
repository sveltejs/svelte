import { ok, test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	html: `<button></button><p title="0">0</p>`,

	async test({ assert, target }) {
		const p = target.querySelector('p');
		const btn = target.querySelector('button');
		flushSync(() => {
			btn?.click();
		});
		assert.equal(p?.innerHTML, '1');
		flushSync(() => {
			btn?.click();
		});
		assert.equal(p?.innerHTML, '2');
	}
});
