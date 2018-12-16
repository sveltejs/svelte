export default {
	props: {
		props: {
			foo: 'lol',
			baz: 40 + 2,
			qux: `this is a ${'piece of'} string`,
			quux: 'core'
		}
	},

	html: `
		<div><p>foo: lol</p>
		<p>baz: 42 (number)</p>
		<p>qux: named</p>
		<p>quux: core</p></div>
	`,

	test({ assert, component, target }) {
		component.props = {
			foo: 'wut',
			baz: 40 + 3,
			qux: `this is a ${'rather boring'} string`,
			quux: 'heart'
		};

		assert.htmlEqual(target.innerHTML, `
			<div><p>foo: wut</p>
			<p>baz: 43 (number)</p>
			<p>qux: named</p>
			<p>quux: heart</p></div>
		`);
	}
};
