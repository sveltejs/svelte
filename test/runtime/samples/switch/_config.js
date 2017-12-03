export default {
	data: {
		x: true
	},

	html: `
		<p>true, therefore Foo</p>
	`,

	test(assert, component, target) {
		component.set({
			x: false
		});

		assert.htmlEqual(target.innerHTML, `
			<p>false, therefore Bar</p>
		`);
	}
};