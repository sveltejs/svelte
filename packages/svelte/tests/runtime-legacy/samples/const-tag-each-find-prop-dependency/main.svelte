<script>
	export let selectedItemId = null;

	const groups = [
		{
			items: [
				{ id: 'a', seats: 2 },
				{ id: 'b', seats: 4 }
			]
		}
	];
</script>

{#each groups as group}
	{@const selectedItem = group.items.find((item) => item.id === selectedItemId)}
	<p>{selectedItem?.seats ?? ''}</p>
{/each}
