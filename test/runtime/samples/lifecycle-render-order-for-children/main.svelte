<script>
	import Item from './Item.svelte';
</script>

<ul>
	{#each [1,2,3] as index}
		<Item {index} />
	{/each}
</ul>


