<script>
	let items = $state([{ id: 3 }, { id: 2 }, { id: 1 }]);
</script>

<button onclick={() => items = [{ id: 1 }, { id: 2 }, { id: 3 }]}>
	update
</button>

{#each items, i (items[i].id)}
	<p>{items[i].id}</p>
{/each}
