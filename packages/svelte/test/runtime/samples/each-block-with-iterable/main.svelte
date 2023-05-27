<script>
	export let numbers = new Set([1, 2]);
</script>

{#each numbers as i}
	<p>{i}</p>
{/each}

{#each numbers as i, index}
	<p>{i} {index}</p>
{/each}

{#each numbers as i, index (i)}
	<p>{i} {index}</p>
{/each}
