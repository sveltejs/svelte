<script>
	import Child from './Child.svelte';

	let uid = 0;

	/** @type {Array<{ id: number }>} */
	let items = $state([]);
</script>

<button onclick={() => items.unshift({ id: uid++ })}>unshift</button>

{#each items as item (item.id)}
	<Child />
{/each}
