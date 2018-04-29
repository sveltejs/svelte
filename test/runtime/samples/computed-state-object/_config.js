export default {
	data: { a: 1 },

	html: `
		<p>a: 1</p>
		<p>x: 2</p>
		<p>y: 4</p>
		<p>z: 8</p>
	`,

	test(assert, component, target) {
		component.set({ a: 2 });

		assert.htmlEqual(target.innerHTML, `
			<p>a: 2</p>
			<p>x: 4</p>
			<p>y: 8</p>
			<p>z: 16</p>
		`)
	},
};
