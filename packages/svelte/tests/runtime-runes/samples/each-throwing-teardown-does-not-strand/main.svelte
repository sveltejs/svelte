<script>
	import Item from './Item.svelte';

	let { items, onteardown } = $props();
</script>

{#each items as item (item)}
	<Item {item} {onteardown} />
{/each}
