<script>
	import { createRawSnippet } from 'svelte';

	const snippet = createRawSnippet({
		mount() {
			const p = document.createElement('p');
			p.textContent = 'mounted';
			return p;
		},
		render() {
			return `<p>rendered</p>`;
		}
	});
</script>

{@render snippet()}
