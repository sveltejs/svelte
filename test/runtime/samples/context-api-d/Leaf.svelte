<script>
	import { getAllContexts } from 'svelte';

	const context = getAllContexts();
</script>

{#each [...context.keys()] as key}
	<div>{key}: {context.get(key)}</div>
{/each}
