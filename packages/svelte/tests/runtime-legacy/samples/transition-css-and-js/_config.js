import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	test({ assert, component, target, raf, logs }) {
		const button = target.querySelector('button');

		flushSync(() => button?.click());
		const div = target.querySelector('div');
		ok(div);

		let ended = 0;
		div.addEventListener('introend', () => {
			ended += 1;
		});

		assert.equal(div.style.scale, '0');
		assert.deepEqual(logs, ['tick: 0']);

		raf.tick(50);
		assert.equal(div.style.scale, '0.5');
		assert.deepEqual(logs, ['tick: 0', 'tick: 0.5']);

		raf.tick(100);
		assert.equal(div.style.scale, '');
		assert.deepEqual(logs, ['tick: 0', 'tick: 0.5', 'tick: 1']);

		assert.equal(ended, 1);
	}
});
