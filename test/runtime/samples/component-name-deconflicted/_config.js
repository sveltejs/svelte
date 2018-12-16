export default {
	html: `
		<span>1</span>
		<span>2</span>
	`,

	test({ assert, component, target }) {
		component.list = [3, 4];

		assert.htmlEqual(target.innerHTML, `
			<span>3</span>
			<span>4</span>
		`);
	}
};