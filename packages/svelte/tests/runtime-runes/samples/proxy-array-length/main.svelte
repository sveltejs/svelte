<script>
	let values = $state(['foo', 'bar', 'baz']);
	let elements = $state([]);
	let nums = $state([1,2,3]);
</script>

{#each values as value, i}
	<input bind:this={elements[i]} bind:value={values[i]} />
{/each}
<div>{elements.length}</div>
