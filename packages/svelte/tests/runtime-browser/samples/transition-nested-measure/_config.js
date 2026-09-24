import { test } from '../../assert';

export default test({
	async test({ assert, target }) {
		const button = target.querySelector('button');
		button?.click();

		// wait for the transition's keyframes to be created
		const animation = await new Promise((resolve, reject) => {
			const start = performance.now();

			function check() {
				const outer = target.querySelector('.level-2');
				const animation = outer
					?.getAnimations()
					.find((a) => a.effect?.getTiming().duration === 100);

				if (animation) {
					resolve(animation);
				} else if (performance.now() - start > 2000) {
					reject(new Error('timed out waiting for the transition to start'));
				} else {
					requestAnimationFrame(check);
				}
			}

			check();
		});

		// the outermost `slide` must have measured the element with its
		// descendants at their natural size, not collapsed to zero by their
		// own starting styles (#18421)
		const keyframes = animation.effect?.getKeyframes() ?? [];
		assert.equal(keyframes[keyframes.length - 1].height, '100px');
	}
});
