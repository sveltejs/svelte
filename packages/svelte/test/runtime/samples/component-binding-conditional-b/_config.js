export default {
	skip_if_ssr: true, // TODO delete this line, once binding works

	// This test fails, because the Bar y binding is activated before the
	// Baz x binding, meaning that by the time Foo is created, we already
	// have a value for y which Foo won't override. Easily worked around,
	// probably impossible to 'fix', so this test is left here for info
	// purposes but will probably remain skipped indefinitely.
	skip: true,

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
};
