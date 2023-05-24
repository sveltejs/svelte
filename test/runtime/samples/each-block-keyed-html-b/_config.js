export default {
	html: `
		<div><span>hello</span> John</div>
		<div><span>hello</span> Jill</div>
	`,

	test({ assert, component, target }) {
		component.names = component.names.reverse();
		assert.htmlEqual(
			target.innerHTML,
			`
			<div><span>hello</span> Jill</div>
			<div><span>hello</span> John</div>
		`
		);
	}
};
