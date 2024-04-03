<script>
	import Item from './Item.svelte';

	var items = Array(1000);
</script>

{#each items as item}
	<Item />
{/each}
