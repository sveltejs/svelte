export default {
	html: `
		<div></div>
		<div>default fallback</div>
	`,
	test({ assert, component, target }) {
		component.condition = true;
		assert.htmlEqual(target.innerHTML, `
			<div>hello #1</div>
			<div>hello #2</div>
		`);
	}
};
