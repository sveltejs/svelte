export default {
	props: {
		visible: true
	},
	intro: true,
	async test({ assert, component, window, waitUntil, target }) {
		/** @type {HTMLElement} */
		const elAnimatedOnMount = target.querySelector('#animated-on-mount');
		/** @type {HTMLElement} */
		const elAnimatedOnInit = target.querySelector('#animated-on-init');

		assert.equal(elAnimatedOnInit.getAnimations().length, 1);
		assert.equal(elAnimatedOnMount.getAnimations().length, 1);
		const elAnimatedOnInitAnimation = elAnimatedOnInit.getAnimations().at(0);
		const elAnimatedOnMountAnimation = elAnimatedOnMount.getAnimations().at(0);

		assert.equal(elAnimatedOnInitAnimation.playState, 'running');
		assert.equal(elAnimatedOnMountAnimation.playState, 'running');
		assert.equal(!!elAnimatedOnInit.style.animation, true);
		assert.equal(!!elAnimatedOnMount.style.animation, true);
		assert.equal(window.document.head.querySelector('style')?.sheet.rules.length, 2);

		await elAnimatedOnInitAnimation.finished.catch((e) => {
			if (e.name === 'AbortError') {
				throw new Error(
					'The animation was aborted, keyframes have been removed before the animation execution end.'
				);
			}
			throw e;
		});
		assert.equal(elAnimatedOnInitAnimation.playState, 'finished');
		assert.equal(elAnimatedOnMountAnimation.playState, 'running');
		assert.equal(!!elAnimatedOnInit.style.animation, true);
		assert.equal(!!elAnimatedOnMount.style.animation, true);
		assert.equal(window.document.head.querySelector('style')?.sheet.rules.length, 2);
		assert.equal(elAnimatedOnInit.getAnimations().length, 1);
		assert.equal(elAnimatedOnMount.getAnimations().length, 1);

		await waitUntil(() => elAnimatedOnInit.getAnimations().length === 0);
		assert.equal(elAnimatedOnInitAnimation.playState, 'idle');
		assert.equal(elAnimatedOnMountAnimation.playState, 'running');
		assert.equal(!!elAnimatedOnInit.style.animation, false);
		assert.equal(!!elAnimatedOnMount.style.animation, true);
		assert.equal(window.document.head.querySelector('style')?.sheet.rules.length, 2);
		assert.equal(elAnimatedOnInit.getAnimations().length, 0);
		assert.equal(elAnimatedOnMount.getAnimations().length, 1);

		await elAnimatedOnMountAnimation.finished.catch((e) => {
			if (e.name === 'AbortError') {
				throw new Error(
					'The animation was aborted, keyframes have been removed before the animation execution end.'
				);
			}
			throw e;
		});
		assert.equal(elAnimatedOnInitAnimation.playState, 'idle');
		assert.equal(elAnimatedOnMountAnimation.playState, 'finished');
		assert.equal(!!elAnimatedOnInit.style.animation, false);
		assert.equal(!!elAnimatedOnMount.style.animation, true);
		assert.equal(window.document.head.querySelector('style')?.sheet.rules.length, 2);
		assert.equal(elAnimatedOnInit.getAnimations().length, 0);
		assert.equal(elAnimatedOnMount.getAnimations().length, 1);

		await waitUntil(() => window.document.head.querySelector('style') === null);
		assert.equal(elAnimatedOnInitAnimation.playState, 'idle');
		assert.equal(elAnimatedOnMountAnimation.playState, 'idle');
		assert.equal(!!elAnimatedOnInit.style.animation, false);
		assert.equal(!!elAnimatedOnMount.style.animation, false);
		assert.equal(window.document.head.querySelector('style'), null);
		assert.equal(elAnimatedOnInit.getAnimations().length, 0);
		assert.equal(elAnimatedOnMount.getAnimations().length, 0);

		/** @type {NodeListOf<HTMLElement>} */
		let divs = target.querySelectorAll('.fading-div');
		/** @type {Animation[]} */
		let animations;
		assert.equal(divs.length, 1);
		divs.forEach((div) => assert.equal(div.getAnimations().length, 0));

		component.visible = false;
		divs = target.querySelectorAll('.fading-div');
		assert.equal(divs.length, 1);
		divs.forEach((div) => assert.equal(div.getAnimations().length, 1));
		animations = Array.from(divs).map((div) => div.getAnimations().at(0));
		animations.forEach((animation) => assert.equal(animation.playState, 'running'));
		assert.equal(window.document.head.querySelector('style')?.sheet.rules.length, 1);
		assert.equal(elAnimatedOnInit.getAnimations().length, 0);
		assert.equal(elAnimatedOnMount.getAnimations().length, 0);

		await animations[0].finished.catch((e) => {
			if (e.name === 'AbortError') {
				throw new Error(
					'The animation was aborted, keyframes have been removed before the animation execution end.'
				);
			}
			throw e;
		});
		divs = target.querySelectorAll('.fading-div');
		assert.equal(divs.length, 1);
		divs.forEach((div) => assert.equal(div.getAnimations().length, 1));
		animations.forEach((animation) => assert.equal(animation.playState, 'finished'));
		assert.equal(window.document.head.querySelector('style')?.sheet.rules.length, 1);
		assert.equal(elAnimatedOnInit.getAnimations().length, 0);
		assert.equal(elAnimatedOnMount.getAnimations().length, 0);

		await waitUntil(() => window.document.head.querySelector('style') === null);
		divs = target.querySelectorAll('.fading-div');
		assert.equal(divs.length, 1);
		divs.forEach((div) => assert.equal(div.getAnimations().length, 0));
		animations.forEach((animation) => assert.equal(animation.playState, 'idle'));
		assert.equal(window.document.head.querySelector('style'), null);
		assert.equal(elAnimatedOnInit.getAnimations().length, 0);
		assert.equal(elAnimatedOnMount.getAnimations().length, 0);

		component.visible = true;
		divs = target.querySelectorAll('.fading-div');
		assert.equal(divs.length, 1);
		divs.forEach((div) => assert.equal(div.getAnimations().length, 1));
		animations = Array.from(divs).map((div) => div.getAnimations().at(0));
		animations.forEach((animation) => assert.equal(animation.playState, 'running'));
		assert.equal(window.document.head.querySelector('style')?.sheet.rules.length, 1);
		assert.equal(elAnimatedOnInit.getAnimations().length, 0);
		assert.equal(elAnimatedOnMount.getAnimations().length, 0);

		await animations[0].finished.catch((e) => {
			if (e.name === 'AbortError') {
				throw new Error(
					'The animation was aborted, keyframes have been removed before the animation execution end.'
				);
			}
			throw e;
		});
		divs = target.querySelectorAll('.fading-div');
		assert.equal(divs.length, 1);
		divs.forEach((div) => assert.equal(div.getAnimations().length, 1));
		animations.forEach((animation) => assert.equal(animation.playState, 'finished'));
		assert.equal(window.document.head.querySelector('style')?.sheet.rules.length, 1);
		assert.equal(elAnimatedOnInit.getAnimations().length, 0);
		assert.equal(elAnimatedOnMount.getAnimations().length, 0);

		await waitUntil(() => window.document.head.querySelector('style') === null);
		divs = target.querySelectorAll('.fading-div');
		assert.equal(divs.length, 1);
		divs.forEach((div) => assert.equal(div.getAnimations().length, 0));
		animations.forEach((animation) => assert.equal(animation.playState, 'idle'));
		assert.equal(window.document.head.querySelector('style'), null);
		assert.equal(elAnimatedOnInit.getAnimations().length, 0);
		assert.equal(elAnimatedOnMount.getAnimations().length, 0);
	}
};
