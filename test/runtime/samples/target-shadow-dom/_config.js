export default {
	skip_if_ssr: true,
	compileOptions: {
		cssHash: () => 'svelte-xyz'
	},
	async test({ assert, component, window }) {
		assert.htmlEqual(window.document.head.innerHTML, '');
		assert.htmlEqual(
			component.div.shadowRoot.innerHTML,
			`
			<style id="svelte-xyz">div.svelte-xyz{color:red}</style>
			<div class="svelte-xyz">Hello World</div>
		`
		);
	}
};
