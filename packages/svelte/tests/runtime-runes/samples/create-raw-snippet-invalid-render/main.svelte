<script>
	import { createRawSnippet } from 'svelte';

	const snippet = createRawSnippet(() => ({
		render: () => `
			<!-- --><div>123</div>
		`
	}));
</script>

{@render snippet()}
