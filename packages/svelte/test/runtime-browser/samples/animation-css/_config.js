export default {
	props: {
		things: [
			{ id: 1, name: 'a' },
			{ id: 2, name: 'b' },
			{ id: 3, name: 'c' },
			{ id: 4, name: 'd' },
			{ id: 5, name: 'e' }
		]
	},

	html: `
		<div>a</div>
		<div>b</div>
		<div>c</div>
		<div>d</div>
		<div>e</div>
	`,

	async test({ assert, component, target, waitUntil }) {
		let divs = target.querySelectorAll('div');
		divs.forEach((div) => {
			div.getBoundingClientRect = function () {
				const index = [...this.parentNode.children].indexOf(this);
				const top = index * 30;

				return {
					left: 0,
					right: 100,
					top,
					bottom: top + 20
				};
			};
		});

		component.things = [
			{ id: 5, name: 'e' },
			{ id: 2, name: 'b' },
			{ id: 3, name: 'c' },
			{ id: 4, name: 'd' },
			{ id: 1, name: 'a' }
		];

		divs = target.querySelectorAll('div');
		assert.ok(~divs[0].style.animation.indexOf('__svelte'));
		assert.equal(divs[1].style.animation, '');
		assert.equal(divs[2].style.animation, '');
		assert.equal(divs[3].style.animation, '');
		assert.ok(~divs[4].style.animation.indexOf('__svelte'));
		assert.equal(divs[0].getAnimations().length, 1);
		assert.equal(divs[1].getAnimations().length, 0);
		assert.equal(divs[2].getAnimations().length, 0);
		assert.equal(divs[3].getAnimations().length, 0);
		assert.equal(divs[4].getAnimations().length, 1);

		const animations = [divs[0].getAnimations().at(0), divs[4].getAnimations().at(0)];

		animations.forEach((animation) => {
			assert.equal(animation.playState, 'running');
		});

		await Promise.all(animations.map((animation) => animation.finished)).catch((e) => {
			if (e.name === 'AbortError') {
				throw new Error(
					'The animation was aborted, keyframes have been removed before the animation execution end.'
				);
			}
			throw e;
		});
		assert.ok(~divs[0].style.animation.indexOf('__svelte'));
		assert.equal(divs[1].style.animation, '');
		assert.equal(divs[2].style.animation, '');
		assert.equal(divs[3].style.animation, '');
		assert.ok(~divs[4].style.animation.indexOf('__svelte'));
		assert.equal(divs[0].getAnimations().length, 1);
		assert.equal(divs[1].getAnimations().length, 0);
		assert.equal(divs[2].getAnimations().length, 0);
		assert.equal(divs[3].getAnimations().length, 0);
		assert.equal(divs[4].getAnimations().length, 1);
		animations.forEach((animation) => {
			assert.equal(animation.playState, 'finished');
		});

		await waitUntil(() => !divs[4].style.animation);
		assert.ok(~divs[0].style.animation, '');
		assert.equal(divs[1].style.animation, '');
		assert.equal(divs[2].style.animation, '');
		assert.equal(divs[3].style.animation, '');
		assert.ok(~divs[4].style.animation, '');
		assert.equal(divs[0].getAnimations().length, 0);
		assert.equal(divs[1].getAnimations().length, 0);
		assert.equal(divs[2].getAnimations().length, 0);
		assert.equal(divs[3].getAnimations().length, 0);
		assert.equal(divs[4].getAnimations().length, 0);
		animations.forEach((animation) => {
			assert.equal(animation.playState, 'idle');
		});
	}
};
