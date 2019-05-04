export default {
	html: `
		<p>4</p>
	`,

	test({ assert, component, target }) {
		assert.htmlEqual(target.innerHTML, `
			<p>4</p>
		`);
	}
};
