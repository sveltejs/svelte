import { test, ok } from '../../assert';

export default test({
	mode: ['client'],
	async test({ assert, target }) {
		const audio = target.querySelector('audio');
		const button = target.querySelector('button');
		ok(audio);

		assert.equal(audio.muted, false);

		audio.muted = true;
		audio.dispatchEvent(new CustomEvent('volumechange'));
		await new Promise((r) => setTimeout(r, 100));
		assert.equal(audio.muted, true, 'event');

		button?.click();
		await new Promise((r) => setTimeout(r, 100));
		assert.equal(audio.muted, false, 'click 1');

		button?.click();
		await new Promise((r) => setTimeout(r, 100));
		assert.equal(audio.muted, true, 'click 2');

		button?.click();
		await new Promise((r) => setTimeout(r, 100));
		assert.equal(audio.muted, false, 'click 3');
	}
});
