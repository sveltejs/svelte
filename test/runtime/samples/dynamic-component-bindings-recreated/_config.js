export default {
	data: {
		x: true,
		foo: 'one'
	},

	html: `
		<p>green one</p>
	`,

	test(assert, component, target) {
		component.set({
			x: false
		});

		assert.htmlEqual(target.innerHTML, `
			<p>red one</p>
		`);

		component.set({
			x: true,
			foo: 'two'
		});

		assert.htmlEqual(target.innerHTML, `
			<p>green two</p>
		`);
	}
};