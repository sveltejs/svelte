<script>
	let { item, attachHandle, onIncrement } = $props();
</script>

<div>
	<span>{item.id}: {item.value}</span>

	{#if item.id === 'a'}
		<span>Type A</span>
	{:else}
		<span>Type B</span>
	{/if}

	<button {@attach attachHandle}>drag</button>
	<button onclick={onIncrement}>+1</button>
</div>
