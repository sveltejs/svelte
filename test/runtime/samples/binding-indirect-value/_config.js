export default {
	async test({ assert, target }) {
		assert.htmlEqual(
			target.innerHTML,
			`
		Parent component "bar"<br />
		Child component "bar"<br />
		`
		);
	}
};
