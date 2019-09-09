export default {
	props: {
		a: 1,
		b: 2
	},

	html: `
		<p>a: 1</p>
		<p>b: 2</p>
		<p>c: 3</p>
	`,

	async test({ assert, component, target }) {
		await component.$set({ a: 4 });

		assert.htmlEqual(target.innerHTML, `
			<p>a: 4</p>
			<p>b: 2</p>
			<p>c: 6</p>
		`);

		await component.$set({ b: 5 });

		assert.htmlEqual(target.innerHTML, `
			<p>a: 4</p>
			<p>b: 5</p>
			<p>c: 9</p>
		`);
	}
};