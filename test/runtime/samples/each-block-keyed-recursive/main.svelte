<script>
	export let tree;
</script>

{#each tree as item, i (item.id)}
	<div>
		{item.id}
		{#if item.sub}
			<svelte:self tree={item.sub}/>
		{/if}
	</div>
{/each}
