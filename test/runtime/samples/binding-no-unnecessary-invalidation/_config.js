export default {
	async test({ assert, target }) {
		assert.htmlEqual(target.innerHTML, `
			<p>0</p>
		`);
	}
};
