<script>
	export let categories;
</script>

{#each categories as category}
	{#each category.things as thing}
		<p>{category.name}: {thing.name}</p>
	{/each}
{/each}
