<script>
	import Row from './Row.svelte';

	const items = $state([{ id: 0 }, { id: 1 }, { id: 2 }]);

	const Table = { Row };
</script>

<button onclick={() => items.reverse()}> flip </button>

{#each items as item (item.id)}
	<Table.Row id={item.id} />
{/each}
