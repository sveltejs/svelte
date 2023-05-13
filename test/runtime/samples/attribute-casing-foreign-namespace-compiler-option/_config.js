// Test support for the `foreign` namespace preserving attribute case,
// including ensuring that SVG elements don't interfere.

export default {
	html: `
		<page horizontalAlignment="center">
			<button textWrap="true" text="button"></button>
			<text wordWrap="true"></text>
		</page>
	`,
	options: {
		hydrate: false // Hydration test will fail as case sensitivity is only handled for svg elements.
	},
	skip_if_hydrate_from_ssr: true,
	compileOptions: {
		namespace: 'foreign'
	},
	test({ assert, target }) {
		const attr = (sel) => target.querySelector(sel).attributes[0].name;
		assert.equal(attr('page'), 'horizontalAlignment');
		assert.equal(attr('button'), 'textWrap');
		assert.equal(attr('text'), 'wordWrap');
	}
};
