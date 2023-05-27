<script>
	let items = [
		{ name: 'A', selected: true },
		{ name: 'B', selected: false },
		{ name: 'C', selected: false },
	]
</script>

{#each items as item}
	{@const toggle = () => item.selected = !item.selected}
	<div>
		{item.selected ? '[Y]' : '[N]'}
		{item.name}
		<button on:click={toggle}>Toggle</button>
	</div>
{/each}
