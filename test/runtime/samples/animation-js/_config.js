export default {
	data: {
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

	test(assert, component, target, window, raf) {
		let divs = document.querySelectorAll('div');
		divs.forEach(div => {
			div.getBoundingClientRect = function() {
				const index = [...this.parentNode.children].indexOf(this);
				const top = index * 30;

				return {
					left: 0,
					right: 100,
					top,
					bottom: top + 20
				}
			};
		})

		const bcr1 = divs[0].getBoundingClientRect();
		const bcr2 = divs[4].getBoundingClientRect();

		component.set({
			things: [
				{ id: 5, name: 'e' },
				{ id: 2, name: 'b' },
				{ id: 3, name: 'c' },
				{ id: 4, name: 'd' },
				{ id: 1, name: 'a' }
			]
		});

		divs = document.querySelectorAll('div');
		assert.equal(divs[0].dy, 120);
		assert.equal(divs[4].dy, -120);

		raf.tick(50);
		assert.equal(divs[0].dy, 60);
		assert.equal(divs[4].dy, -60);

		raf.tick(100);
		assert.equal(divs[0].dy, 0);
		assert.equal(divs[4].dy, 0);
	}
};