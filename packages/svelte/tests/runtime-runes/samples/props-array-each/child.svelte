<script>
	let { array } = $props();
</script>

{#each array as number}
	<p>{number.v}</p>
{/each}

{#each array as number (number)}
	<p>{number.v}</p>
{/each}

{#each array as number (number.v)}
	<p>{number.v}</p>
{/each}
