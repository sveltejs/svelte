<script>
	import Child from './Child.svelte';

	let numbers = [1, 2, 3];
</script>

<p>{numbers.join(', ')}</p>

{#each numbers as n}
	<Child bind:value={n} />
{/each}

<p>{numbers.join(', ')}</p>
