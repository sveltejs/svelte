<script>
	import { registry } from './registry.svelte.js';
	let name = $derived(registry.current.name);
	$effect(() => {
		console.log('C sees', registry.current.name);
	});
</script>

{#if name}
	<p>C sees {name}</p>
{/if}
