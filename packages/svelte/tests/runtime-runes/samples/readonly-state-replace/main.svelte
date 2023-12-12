<script>
	let items = $state.readonly([0]);

	const addItem = () => {
		items = [...items, items.length];
	};
</script>

<button on:click={addItem}>
	{items.join(', ')}
</button>
