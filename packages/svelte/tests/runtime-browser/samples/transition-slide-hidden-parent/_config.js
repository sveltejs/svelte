import { test } from '../../assert';

export default test({
	async test({ assert, window }) {
		window.document.querySelector('button')?.click();
		await new Promise((r) => setTimeout(r, 100));

		const p = window.document.querySelector('p');
		const animations = /** @type {HTMLElement} */ (p).getAnimations();
		assert.equal(animations.length, 1);

		// when the element has no layout box, computed dimensions resolve to 'auto',
		// which must not end up as NaN values that the browser rejects (#14205)
		const keyframes = /** @type {KeyframeEffect} */ (animations[0].effect).getKeyframes();
		assert.ok(keyframes.length > 0);

		for (const keyframe of keyframes) {
			assert.ok('height' in keyframe, 'height was rejected as an invalid keyframe value');

			for (const value of Object.values(keyframe)) {
				assert.ok(!String(value).includes('NaN'), `unexpected NaN in keyframe: ${value}`);
			}
		}
	}
});
