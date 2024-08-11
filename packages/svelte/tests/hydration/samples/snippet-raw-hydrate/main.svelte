<script>
	import { createRawSnippet } from 'svelte';

	const snippet = createRawSnippet(() => ({
		render: () => `
			<p>rendered</p>
		`,
		setup(p) {
			p.textContent = 'hydrated';
		}
	}));
</script>

{@render snippet()}
