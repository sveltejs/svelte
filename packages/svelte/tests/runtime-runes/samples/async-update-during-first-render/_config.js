import { tick } from 'svelte';
import { test } from '../../test';

// An update made while the first render is still waiting on its awaits
// is lost once they resolve: the component shows `one 0`, and `held`
// never becomes 1, though `slow(1)` resolved. With a single await, or
// on 5.57.3, it shows `one 1`.
export default test({
	mode: ['client'],
	async test({ assert, target, instance, logs }) {
		// still waiting on `slow(0)`
		await tick();
		instance.bump();
		await tick();
		assert.deepEqual(logs, [0, 1]);

		instance.resolve();
		await tick();
		await tick();
		await new Promise((r) => setTimeout(r, 10));

		assert.htmlEqual(target.innerHTML, `<p>one 1</p>`);
		assert.deepEqual(logs, [0, 1]);
	}
});
