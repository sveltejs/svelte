<script>
	let items = [{ id: 3 }, { id: 2 }, { id: 1 }];
</script>

{#each items, i (items[i].id)}
	<p>{items[i].id}</p>
{/each}
