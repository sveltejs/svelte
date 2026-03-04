<script>
	import { writable } from 'svelte/store';

	const items = writable([{ id: 1 }]);

	function add_item() {
		items.update(arr => [...arr, { id: arr.length + 1 }]);
	}

	function query(item) {
		return Promise.resolve([item.id * 10, item.id * 20]);
	}
</script>

<svelte:boundary>
	<ul>
		{#each $items as item (item.id)}
			<li data-item={item.id}>
				{#each await query(item) as value}
					<span>{value}</span>
				{/each}
			</li>
		{/each}
	</ul>
	
	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>

<button onclick={add_item}>add</button>
