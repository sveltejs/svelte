import { test } from '../../test';

export default test({
	get props() {
		return {
			things: [
				{ id: 1, name: 'a' },
				{ id: 2, name: 'b' },
				{ id: 3, name: 'c' },
				{ id: 4, name: 'd' },
				{ id: 5, name: 'e' }
			]
		};
	},

	html: `
		<div>a</div>
		<div>b</div>
		<div>c</div>
		<div>d</div>
		<div>e</div>
	`,

	test({ assert, component, target, raf }) {
		let divs = target.querySelectorAll('div');
		divs.forEach((div) => {
			// @ts-expect-error
			div.getBoundingClientRect = function () {
				// @ts-expect-error
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
		assert.ok(divs[0].getAnimations().length > 0);
		assert.equal(divs[1].getAnimations().length, 0);
		assert.equal(divs[2].getAnimations().length, 0);
		assert.equal(divs[3].getAnimations().length, 0);
		assert.ok(divs[4].getAnimations().length > 0);

		raf.tick(100);
		assert.deepEqual([divs[0].getAnimations().length, divs[4].getAnimations().length], [0, 0]);
	}
});
