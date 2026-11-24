<svelte:options customRenderer={null} />

<script>
	import Child from './Child.svelte';

	let items = $state(['a', 'b', 'c']);
</script>

<button onclick={() => (items = items.toReversed())}>reverse</button>
<button onclick={() => (items = [items[0], 'x', ...items.slice(1)])}>insert</button>
<button onclick={() => (items = [items[items.length - 1], ...items.slice(0, -1)])}>rotate</button>
<button onclick={() => (items = items.filter((item) => item !== 'x'))}>remove x</button>

{#each items as item (item)}
	<Child {item}></Child>
{/each}
