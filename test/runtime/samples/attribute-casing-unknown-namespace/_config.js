// Test support for unknown namespaces preserving attribute case (eg svelte-native).

export default {
	html: `
		<page xmlns="tns" horizontalAlignment="center">
			<button textWrap="true" text="button">
		</page>
	`,
	options: {
		hydrate: false // Hydrations currently doesn't work, the case sensitivity is only handled for svg elements.
	},

	test({ assert, target }) {
		const attr = sel => target.querySelector(sel).attributes[0].name;
		assert.equal(attr('page'), 'horizontalAlignment');
		assert.equal(attr('button'), 'textWrap');
	}
};
