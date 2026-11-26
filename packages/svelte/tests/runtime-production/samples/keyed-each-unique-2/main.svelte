<script>
	let data = $state([1, 2, 3]);
</script>

<button onclick={() => data = [1, 1, 1]}>add</button>
{#each data as d (d)}
	{d}
{/each}
