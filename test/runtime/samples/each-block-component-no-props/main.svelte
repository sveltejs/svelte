<script>
	import Child from './Child.svelte';

	let items = [1];

	export function remove() {
		items = [];
	}
</script>

{#each items as item}
	<Child/>
{/each}
