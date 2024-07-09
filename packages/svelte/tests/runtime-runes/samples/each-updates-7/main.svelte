<script>
	const items = $state([
		{ name: 'test', id: 1, color: 'red' },
		{ name: 'test 2', id: 2 },
		{ name: 'test 3', id: 3 },
	]);
	const onclick = () => {
		const from = 0;
		const to = 2;
		items.splice(to, 0, items.splice(from, 1)[0]);
	};
</script>

{#snippet renderItem(item)}
	<li>
		{item.name} ({item.id})
	</li>
	{#if item.color}<span style="background-color: {item.color}; width: 20px; height: 20px; display: inline-block;"></span>{/if}
{/snippet}

<ul>
	{#each items as item (item.id)}
		{@render renderItem(item)}
	{/each}
</ul>
<button {onclick}>Swap items 1 & 3</button>
