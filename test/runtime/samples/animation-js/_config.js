export default {
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

	test({ assert, component, raf }) {
		let divs = document.querySelectorAll('div');
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

		divs = document.querySelectorAll('div');
		assert.equal(divs[0].dy, 120);
		assert.equal(divs[4].dy, -120);

		raf.tick(50);
		assert.equal(divs[0].dy, 60);
		assert.equal(divs[4].dy, -60);

		raf.tick(100);
		assert.equal(divs[0].dy, 0);
		assert.equal(divs[4].dy, 0);

		component.things = [
			{ id: 1, name: 'a' },
			{ id: 2, name: 'b' },
			{ id: 3, name: 'c' },
			{ id: 4, name: 'd' },
			{ id: 5, name: 'e' }
		];

		divs = document.querySelectorAll('div');

		assert.equal(divs[0].dy, 120);
		assert.equal(divs[4].dy, -120);

		raf.tick(150);
		assert.equal(divs[0].dy, 60);
		assert.equal(divs[4].dy, -60);

		raf.tick(200);
		assert.equal(divs[0].dy, 0);
		assert.equal(divs[4].dy, 0);
	}
};
