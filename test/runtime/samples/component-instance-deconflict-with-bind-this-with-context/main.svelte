<script>
	import Item from './Item.svelte';
	const components = [];
</script>

<ul>
	{#each [0, 1, 2] as item}
		<Item bind:this={components[item]} />
	{/each}
</ul>
