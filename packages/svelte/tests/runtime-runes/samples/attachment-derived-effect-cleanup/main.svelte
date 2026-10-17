<script>
	import Item from './Item.svelte';
	import { create_attachment } from './attachment.svelte.js';

	let items = $state([
		{ id: 'a', value: 0 },
		{ id: 'b', value: 0 }
	]);

	function increment(id) {
		items = items.map((item) => (item.id === id ? { id: item.id, value: item.value + 1 } : item));
	}
</script>

<pre>{JSON.stringify(items)}</pre>

{#each items as item, index (item.id)}
	{@const attachment = create_attachment({
		id: item.id,
		get index() {
			return index;
		}
	})}
	<Item
		item={items[index]}
		attachHandle={attachment.attach}
		onIncrement={() => increment(item.id)}
	/>
{/each}

<button onclick={() => (items = items.slice(1))}>Remove first</button>
