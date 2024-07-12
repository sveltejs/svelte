<script>
	import { createRawSnippet } from 'svelte';

	const snippet = createRawSnippet({
		render() {
			return `<p>rendered</p>`;
		},
		update(p) {
			p.textContent = 'hydrated';
		}
	});
</script>

{@render snippet()}
