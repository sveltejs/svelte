import { test } from '../../test';

export default test({
	immutable: true,

	html: `
		<div>
			<h3>Called 1 times.</h3>
			<p>baz true</p>
		</div>
	`,

	ssrHtml: `
		<div>
			<h3>Called 0 times.</h3>
			<p>baz false</p>
		</div>`,

	test({ assert, component, target }) {
		const nested = component.nested;

		assert.htmlEqual(
			target.innerHTML,
			`
			<div>
				<h3>Called 1 times.</h3>
				<p>baz true</p>
			</div>
		`
		);

		// eslint-disable-next-line no-self-assign
		nested.foo = nested.foo;
		assert.htmlEqual(
			target.innerHTML,
			`
			<div>
				<h3>Called 1 times.</h3>
				<p>baz true</p>
			</div>
		`
		);
	}
});
