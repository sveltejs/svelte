export default {
	async test({ assert, component, target }) {
		await Promise.resolve();

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>a: 1</p>
			<p>rest: {"b":2,"c":3}</p>
			<p>a: 1</p>
			<p>b: 2</p>
			<p>rest: [3,4,5,6]</p>
			<p>a: 1</p>
			<p>rest: {"b":2,"c":3}</p>
			<p>a: 1</p>
			<p>b: 2</p>
			<p>rest: [3,4,5,6]</p>
			`
		);
	}
};
