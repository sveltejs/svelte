<script>
	let value = $state(1);
</script>

{#each [1, 2, 3] as number}
	<input type="radio" name="foo" value={number} bind:group={value}>
{/each}

{value}
