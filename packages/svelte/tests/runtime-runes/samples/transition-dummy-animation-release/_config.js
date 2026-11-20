import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, raf, target }) {
		/** @type {Animation[]} */
		const animations = [];
		const animate = HTMLElement.prototype.animate;

		/**
		 * @param {Keyframe[] | PropertyIndexedKeyframes | null} keyframes
		 * @param {number | KeyframeAnimationOptions} [options]
		 */
		HTMLElement.prototype.animate = function (keyframes, options) {
			const animation = animate.call(this, keyframes, options);
			animations.push(animation);
			return animation;
		};

		try {
			const btn = target.querySelector('button');

			btn?.click();
			flushSync();
			raf.tick(100);
			assert.htmlEqual(target.innerHTML, '<button>toggle</button><p style="">fade</p>');
		} finally {
			HTMLElement.prototype.animate = animate;
		}

		// the first animation is the dummy that covers the delay. it is cancelled once the
		// transition begins and must let go of its finish handler, which closes over the
		// element: WebKit keeps a cancelled animation alive along with its handlers
		const [dummy] = animations;
		assert.equal(animations.length, 2);
		assert.equal(dummy.playState, 'idle');
		assert.equal(dummy.onfinish, null);
	}
});
