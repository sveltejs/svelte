import { ok, test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	html: `<button></button><p>test</p>`,

	async test({ assert, target, instance }) {
		const btn = target.querySelector('button');
		let p = target.querySelector('p');
		assert.equal(p?.innerHTML, 'test');
		flushSync(() => {
			btn?.click();
		});
		p = target.querySelector('p');
		assert.equal(p, undefined);
	}
});
