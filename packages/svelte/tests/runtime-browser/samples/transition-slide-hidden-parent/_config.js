import { ok, test } from '../../assert';

export default test({
	async test({ assert, window }) {
		window.document.querySelector('button')?.click();
		await new Promise((r) => setTimeout(r, 100));

		const p = window.document.querySelector('p');
		const animations = /** @type {HTMLElement} */ (p).getAnimations();
		assert.equal(animations.length, 1);

		// when the element has no layout box, computed dimensions resolve to 'auto',
		// which must not end up as NaN values that the browser rejects (#14205)
		const effect = /** @type {KeyframeEffect} */ (animations[0].effect);
		const keyframes = effect.getKeyframes();
		ok(keyframes.length > 0);
		assert.equal(effect.getTiming().duration, 400);

		for (const keyframe of keyframes) {
			ok(!('height' in keyframe), 'unresolved height should be omitted');

			for (const value of Object.values(keyframe)) {
				ok(!String(value).includes('NaN'), `unexpected NaN in keyframe: ${value}`);
			}
		}
	}
});
