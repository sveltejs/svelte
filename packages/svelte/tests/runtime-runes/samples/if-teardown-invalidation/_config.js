import { flushSync, fork, tick } from 'svelte';
import { test } from '../../test';
import { async_mode } from '../../../helpers';

export default test({
	mode: ['client', 'hydrate'],
	async test({ assert, target, logs }) {
		const [button] = target.querySelectorAll('button');
		const initial = '<button>swap A → B</button><p>registry.current: A</p><p>A (registered)</p>';

		for (const mode of async_mode ? ['tick', 'flushSync', 'fork'] : ['tick', 'flushSync']) {
			assert.htmlEqual(target.innerHTML, initial);

			if (mode === 'fork') {
				const discarded = fork(() => button.click());
				await tick();
				assert.htmlEqual(target.innerHTML, initial);
				assert.deepEqual(logs, []);
				discarded.discard();

				const committed = fork(() => button.click());
				await tick();
				assert.htmlEqual(target.innerHTML, initial);
				assert.deepEqual(logs, []);
				await committed.commit();
			} else {
				button.click();
				if (mode === 'flushSync') flushSync();
				else await tick();
			}

			assert.htmlEqual(
				target.innerHTML,
				'<button>swap B → A</button><p>registry.current: null</p><p>B — no registration, no C</p>'
			);
			assert.deepEqual(logs, ['B mounted']);
			logs.length = 0;

			button.click();
			await tick();
		}
	}
});
