import { test } from '../../test';

export default test({
	get props() {
		return {
			bar: 'lol',
			x: 2,
			compound: 'piece of',
			go: { deeper: 'core' }
		};
	},

	html: `
		<div><p>foo: lol</p>
		<p>baz: 42 (number)</p>
		<p>qux: this is a piece of string</p>
		<p>quux: core</p></div>
	`,

	test({ assert, component, target }) {
		component.bar = 'wut';
		component.x = 3;
		component.compound = 'rather boring';
		component.go = { deeper: 'heart' };

		assert.htmlEqual(
			target.innerHTML,
			`
			<div><p>foo: wut</p>
			<p>baz: 43 (number)</p>
			<p>qux: this is a rather boring string</p>
			<p>quux: heart</p></div>
		`
		);
	}
});
