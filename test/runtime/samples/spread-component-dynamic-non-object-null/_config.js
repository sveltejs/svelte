export default {
	props: {
		props: {
			foo: 'lol',
			baz: 40 + 2,
		}
	},

	html: `
		<div><p>foo: lol</p>
		<p>baz: 42</p>
		<p>qux: named</p>
	`,

	test({ assert, component, target }) {
		component.props = null;

		assert.htmlEqual(target.innerHTML, `
			<div><p>foo: undefined</p>
			<p>baz: undefined</p>
			<p>qux: named</p>
		`);
	}
};
