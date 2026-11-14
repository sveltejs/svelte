import { tick } from 'svelte';
import { test } from '../../test';
import { raf } from '../../../animation-helpers';

export default test({
	async test({ assert, target, logs }) {
		target.querySelector('button')?.click();
		await tick();
		raf.tick(110);
		await tick();

		assert.deepEqual(logs, ['show', true]);
	}
});
