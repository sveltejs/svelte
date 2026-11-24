import { tick } from 'svelte';
import { test } from '../../test';
import { raf } from '../../../animation-helpers';

export default test({
	async test({ assert, target, logs }) {
		const [hide, change] = target.querySelectorAll('button');
		hide.click();
		await tick();

		raf.tick(110);
		await tick();
		assert.deepEqual(logs, [['first', true, 0, 0]]);

		// Both outros captured the same teardown context. The second must not reuse
		// the derived value cached by the first, but must still see `show` as true.
		change.click();
		await tick();
		raf.tick(210);
		await tick();
		assert.deepEqual(logs, [
			['first', true, 0, 0],
			['second', true, 1, 2]
		]);
	}
});
