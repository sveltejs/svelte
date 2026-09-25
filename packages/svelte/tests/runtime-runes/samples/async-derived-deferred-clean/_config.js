import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [update, resolve_a, resolve_b] = target.querySelectorAll('button');
		assert.deepEqual(logs, [0]);

		update.click();
		await tick();
		assert.deepEqual(logs, [0]);

		// The new if block evaluates parity while the text effect is still deferred.
		resolve_b.click();
		await tick();
		assert.deepEqual(logs, [0, 2]);

		// The batch must forget its earlier deferred DIRTY entry for parity.
		resolve_a.click();
		await tick();
		assert.deepEqual(logs, [0, 2]);
		assert.htmlEqual(
			target.innerHTML,
			'<button>update</button><button>resolve a</button><button>resolve b</button><p>2:0</p>'
		);
	}
});
