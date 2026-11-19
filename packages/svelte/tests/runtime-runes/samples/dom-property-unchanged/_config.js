import { tick } from 'svelte';
import { ok, test } from '../../test';

export default test({
	async test({ assert, target }) {
		const audio = target.querySelector('audio');
		const input = target.querySelector('input');
		ok(audio);
		ok(input);
		const [unrelated, change, clear] = target.querySelectorAll('button');

		assert.equal(audio.muted, false);
		assert.equal(audio.volume, 0.5);
		// The initial undefined must still go through the DOM setter.
		assert.equal(input.defaultValue, 'undefined');

		audio.muted = true;
		audio.volume = 0.75;
		input.defaultValue = 'external';

		for (let i = 0; i < 2; i++) {
			unrelated.click();
			await tick();

			assert.equal(audio.muted, true);
			assert.equal(audio.volume, 0.75);
			assert.equal(input.defaultValue, 'external');
		}

		change.click();
		await tick();

		assert.equal(audio.muted, true);
		assert.equal(audio.volume, 0.25);
		assert.equal(input.defaultValue, 'updated');

		clear.click();
		await tick();

		assert.equal(input.defaultValue, 'undefined');
	}
});
