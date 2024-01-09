<script>
	import { writable } from 'svelte/store';

	let snippet = writable(hello);
</script>

{#snippet hello()}
	<p>hello world</p>
{/snippet}

{@render $snippet()}
