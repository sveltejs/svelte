export default {
	data: {
		x: true
	},

	html: `
		<div><p>true, therefore Foo</p></div>
	`,

	test(assert, component, target) {
		component.set({
			x: false
		});

		assert.htmlEqual(target.innerHTML, `
			<div><p>false, therefore Bar</p></div>
		`);
	}
};