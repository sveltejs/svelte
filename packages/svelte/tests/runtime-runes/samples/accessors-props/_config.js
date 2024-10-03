import { ok, test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	html: `<p>0</p>`,

	async test({ assert, target, instance }) {
		const p = target.querySelector('p');
		ok(p);
		flushSync(() => {
			instance.count++;
		});
		assert.equal(p.innerHTML, '1');
	}
});
