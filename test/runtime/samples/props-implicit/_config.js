export default {
	props: {
		x: 1
	},

	html: `
		<pre>{"x":1}</pre>
	`,

	async test({ assert, component, target }) {
		await component.$set({ x: 2 });

		assert.htmlEqual(target.innerHTML, `
			<pre>{"x":2}</pre>
		`);
	}
};