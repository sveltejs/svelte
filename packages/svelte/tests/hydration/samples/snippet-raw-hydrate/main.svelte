<script>
	import { createRawSnippet } from 'svelte';

	const snippet = createRawSnippet({
		mount() {
			const p = document.createElement('p');
			p.textContent = 'mounted';
			return p;
		},
		hydrate(p) {
			p.textContent = 'hydrated';
		},
		render() {
			return `<p>rendered</p>`;
		}
	});
</script>

{@render snippet()}
