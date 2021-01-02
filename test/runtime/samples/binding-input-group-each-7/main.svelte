<script>
	const list = [
		{ id: 'x', data: [{ id: 1, data: [] }, { id: 2, data: [] }] },
		{ id: 'y', data: [{ id: 1, data: [] }, { id: 2, data: [] }] },
		{ id: 'z', data: [{ id: 1, data: [] }, { id: 2, data: [] }] }
	];
</script>

{#each list as { id, data }}
	{#each data as item}
		<input type="checkbox" bind:group={item.data} value="a" data-index="{id}-{item.id}" />
		<input type="checkbox" bind:group={item.data} value="b" data-index="{id}-{item.id}" />
		<input type="checkbox" bind:group={item.data} value="c" data-index="{id}-{item.id}" />
	{/each}
{/each}
