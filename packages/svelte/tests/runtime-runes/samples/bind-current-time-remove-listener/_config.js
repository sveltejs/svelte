import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		const audio = target.querySelector('audio');
		const btn = target.querySelector('button');

		ok(audio);

		flushSync(() => {
			audio.currentTime = 10;
			audio.dispatchEvent(new Event('timeupdate'));
		});
		assert.deepEqual(logs, ['event']);

		flushSync(() => {
			btn?.click();
		});
		flushSync(() => {
			audio.currentTime = 20;
			audio.dispatchEvent(new Event('timeupdate'));
		});
		assert.deepEqual(logs, ['event']);
	}
});
