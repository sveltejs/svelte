<script>
	import { createRawSnippet } from 'svelte';

	const snippet = createRawSnippet(() => ({
		render: () => `<span>hello</span>`
	}));
</script>

{@render snippet()}
