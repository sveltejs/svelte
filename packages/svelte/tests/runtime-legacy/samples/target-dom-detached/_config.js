import { test } from '../../test';

export default test({
	skip_if_ssr: true,
	compileOptions: {
		cssHash: () => 'svelte-xyz'
	},
	async test({ assert, component, window }) {
		assert.htmlEqual(
			window.document.head.innerHTML,
			'<style>div.svelte-xyz\n{\ncolor:\nred;\n}</style>'
		);
		assert.htmlEqual(component.div.innerHTML, '<div class="svelte-xyz">Hello World</div>');
	}
});
