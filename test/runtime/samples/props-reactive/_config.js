export default {
	show: 1,

	props: {
		a: 1,
		b: 2,
		c: 3,
		d: 4
	},

	html: `
		<p>4</p>
	`,

	test({ assert, component, target }) {
		component.d = 5;

		assert.htmlEqual(target.innerHTML, `
			<p>5</p>
		`);
	}
};