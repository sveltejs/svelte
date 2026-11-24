<svelte:options customRenderer={null} />

<script>
	import Child from './Child.svelte';

	let items = $state(['a', 'b', 'c']);

	export function reverse() {
		items = items.toReversed();
	}

	export function remove_middle() {
		items = [items[0], items[2]];
	}
</script>

<div>
	{#each items as item (item)}
		<Child message={item}></Child>
	{/each}
</div>
