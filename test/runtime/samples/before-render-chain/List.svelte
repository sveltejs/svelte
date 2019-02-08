<script>
	import Item from './Item.svelte';

	export let items = [3, 2, 1];

	export function update() {
		items = [1, 2, 3, 4, 5];
	}
</script>

{#each items as item}
	<Item item={item} />
{/each}
