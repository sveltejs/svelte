<script>
	import Component from './Component.svelte';
	const items = [0];
</script>

{#each items as item, idx(item)}
	<Component bind:item />
{/each}

<p>{items}</p>