export default {
	props: {
		a: [{ id: 'foo' }, { id: 'bar' }, { id: 'baz' }]
	},

	html: `
		<span>foo</span><span>bar</span><span>baz</span>
	`,

	test({ assert, component, target }) {
		component.a = [
			{ id: 'yep' },
			{ id: 'nope' }
		];

		assert.htmlEqual(target.innerHTML, `
			<span>yep</span><span>nope</span>
		`);
	}
};
