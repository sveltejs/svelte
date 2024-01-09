<script>
	let array;
	$: {
		// test that this doesn't rerun on array change
		array = []
		array[0] = [false, false];
		array[1] = [false, false];
	}
</script>

{#each array as row, i}
	{#each row as item, j}
		<button on:click={() => array[i][j] = !array[i][j]}>{item}</button>
	{/each}
{/each}
