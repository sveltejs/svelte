<script>
	import Child from './Child.svelte';
	let items = $state([]);

	function add_item() {
		items.push({
			id: items.length,
			text: 'Item ' + (items.length + 1),
			dom: null,
		})
	}

	function clear() {
		items = [];
	}
</script>

<button on:click={add_item}>add item</button>
<button on:click={clear}>clear</button>

{#each items as item, index (item.id)}
	<Child bind:item={items[index]} />
{/each}
