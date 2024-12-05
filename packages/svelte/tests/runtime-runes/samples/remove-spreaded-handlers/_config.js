import { ok, test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	async test({ assert, target, instance }) {
		const p = target.querySelector('p');
		const btn = target.querySelector('button');
		const input = target.querySelector('input');
		ok(p);

		flushSync(() => {
			btn?.click();
		});
		assert.equal(p.innerHTML, '1');

		flushSync(() => {
			input?.click();
		});
		flushSync(() => {
			btn?.click();
		});
		assert.equal(p.innerHTML, '1');

		flushSync(() => {
			input?.click();
		});
		flushSync(() => {
			btn?.click();
		});
		assert.equal(p.innerHTML, '2');
	}
});
