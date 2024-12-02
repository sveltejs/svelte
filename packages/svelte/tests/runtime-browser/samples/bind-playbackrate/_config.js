import { test, ok } from '../../assert';

export default test({
	mode: ['client'],
	async test({ assert, target }) {
		const audio = target.querySelector('audio');
		const button = target.querySelector('button');
		ok(audio);

		assert.equal(audio.playbackRate, 0.5);

		audio.playbackRate = 1.0;
		audio.dispatchEvent(new CustomEvent('ratechange'));
		await new Promise((r) => setTimeout(r, 100));
		assert.equal(audio.playbackRate, 1.0);

		button?.click();
		await new Promise((r) => setTimeout(r, 100));
		assert.equal(audio.playbackRate, 2);

		button?.click();
		await new Promise((r) => setTimeout(r, 100));
		assert.equal(audio.playbackRate, 3);

		button?.click();
		await new Promise((r) => setTimeout(r, 100));
		assert.equal(audio.playbackRate, 4);
	}
});
