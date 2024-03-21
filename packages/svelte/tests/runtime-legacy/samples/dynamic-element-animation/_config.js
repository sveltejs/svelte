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
			],
			tag: 'div'
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
		component.tag = 'p';
		assert.equal(target.querySelectorAll('p').length, 5);

		component.tag = 'div';
		let divs = target.querySelectorAll('div');
		divs.forEach((div) => {
			div.getBoundingClientRect = function () {
				const index = [...(this.parentNode?.children ?? [])].indexOf(this);
				const top = index * 30;

				return /** @type {DOMRect} */ ({
					left: 0,
					right: 100,
					top,
					bottom: top + 20
				});
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
		assert.equal(divs[0].style.transform, 'translate(0px, 120px)');
		assert.equal(divs[1].style.transform, '');
		assert.equal(divs[2].style.transform, '');
		assert.equal(divs[3].style.transform, '');
		assert.equal(divs[4].style.transform, 'translate(0px, -120px)');

		raf.tick(100);
		assert.deepEqual([divs[0].style.transform, divs[4].style.transform], ['', '']);
	}
});
