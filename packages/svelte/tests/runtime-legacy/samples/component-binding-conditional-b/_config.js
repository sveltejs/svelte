import { test } from '../../test';

export default test({
	// This test failed in Svelte 4, because the Bar y binding is activated before the
	// Baz x binding, meaning that by the time Foo is created, we already
	// have a value for y which Foo won't override. Easily worked around,
	// probably impossible to 'fix', so this test is left here for info
	// purposes but will probably remain skipped indefinitely - or rather,
	// it's okay if it needs to be skipped again sometime in the future.
	html: `
		<p>y: foo</p>
		<p>y: foo</p>
	`,

	test({ assert, component, target }) {
		component.x = false;

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>y: foo</p>
			<p>y: foo</p>
		`
		);
	}
});
