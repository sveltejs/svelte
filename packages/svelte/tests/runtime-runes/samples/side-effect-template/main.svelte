<script>
	let items = $state([]);
</script>

<button onclick={() => items.push(3, 2, 1)}>Add</button>
{#each items.sort() as item (item)}
  <p>{item}</p>
{/each}

