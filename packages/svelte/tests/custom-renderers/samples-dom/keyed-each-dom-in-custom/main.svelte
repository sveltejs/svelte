<script>
	import Child from './Child.svelte';

	let items = $state(['a', 'b', 'c']);

	export function reverse() {
		items = items.toReversed();
	}
</script>

<custom>
	{#each items as item (item)}
		<Child message={item}></Child>
	{/each}
</custom>
