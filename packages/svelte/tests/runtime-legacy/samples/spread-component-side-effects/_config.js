import { test } from '../../test';

export default test({
	get props() {
		return {};
	},

	html: `
		<div><p>i: 1</p>
		<p>foo: foo</p>
		<p>qux: named</p>
	`,

	test({ assert, component, target }) {
		component.foo = 'lol';

		assert.htmlEqual(
			target.innerHTML,
			`
			<div><p>i: 2</p>
			<p>foo: lol</p>
			<p>qux: named</p>
		`
		);
	}
});
