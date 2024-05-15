<script>
	let { items1, items2 } = $props();
</script>

{#each items1 as item}
	<p>{item.name}</p>
{:else}
	<p>empty</p>
{/each}

{#each items2 as item}
	<p>{item.name}</p>
{:else}
	<p>empty</p>
{/each}
