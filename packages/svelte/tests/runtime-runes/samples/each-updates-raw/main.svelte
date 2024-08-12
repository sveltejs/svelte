<script>
	let raw_items = $state.raw([
		{ id: 0, text: 'a' },
		{ id: 1, text: 'b' },
		{ id: 2, text: 'c' }
	]);
</script>

{#each raw_items as item (item.id)}
	{console.log(item.text)}
	{item.text}
{/each}

<button
	onclick={() => {
		raw_items = [...raw_items, { id: 3, text: 'd' }];
	}}
></button>
