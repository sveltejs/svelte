import { test, ok } from '../../assert';

export default test({
	mode: ['client'],
	async test({ assert, target }) {
		const audio = target.querySelector('audio');
		const button = target.querySelector('button');
		ok(audio);

		assert.equal(audio.volume, 0.1);

		audio.volume = 0.2;
		audio.dispatchEvent(new CustomEvent('volumechange'));
		await new Promise((r) => setTimeout(r, 100));
		assert.equal(audio.volume, 0.2);

		button?.click();
		await new Promise((r) => setTimeout(r, 100));
		assert.equal(audio.volume, 0.2 + 0.1); // JavaScript can't add floating point numbers correctly

		button?.click();
		await new Promise((r) => setTimeout(r, 100));
		assert.equal(audio.volume, 0.2 + 0.1 + 0.1);

		button?.click();
		await new Promise((r) => setTimeout(r, 100));
		assert.equal(audio.volume, 0.2 + 0.1 + 0.1 + 0.1);
	}
});
