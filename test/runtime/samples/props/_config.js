export default {
	props: {
		x: 1
	},

	html: `
		<p>{"x":1}</p>
	`,

	test({ assert, component, target }) {
		component.x = 2;

		assert.htmlEqual(target.innerHTML, `
			<p>{"x":2}</p>
		`);
	}
};
