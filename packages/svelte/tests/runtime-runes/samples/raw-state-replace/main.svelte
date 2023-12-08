<script>
	let items = $state.raw([0]);

	const addItem = () => {
		items = [...items, items.length];
	};
</script>

<button on:click={addItem}>
	{items.join(', ')}
</button>
