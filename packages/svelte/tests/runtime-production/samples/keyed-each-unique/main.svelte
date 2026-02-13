<script>
	let data = $state([1, 2, 3, 4, 5]);
</script>

<button onclick={() => data = [1, 1, 3, 1]}>add</button>
{#each data as d (d)}
	{d}
{/each}
