export default {
	html: `
		<div data-a="1" data-b="2"></div>
		<div data-a="3" data-b="4"></div>
	`,

	data: {
		things: [
			{ a: 1, b: 2 },
			{ a: 3, b: 4 }
		]
	},

	test(assert, component, target) {
		const { things } = component.get();

		component.set({
			things: things.reverse()
		});

		assert.htmlEqual(target.innerHTML, `
			<div data-a="3" data-b="4"></div>
			<div data-a="1" data-b="2"></div>
		`);
	},
};
