export default {
	data: {
		x: 1
	},

	html: `
		<p>Foo 1</p>
	`,

	test(assert, component, target) {
		component.set({
			x: 2
		});

		assert.htmlEqual(target.innerHTML, `
			<p>Foo 2</p>
		`);
	}
};