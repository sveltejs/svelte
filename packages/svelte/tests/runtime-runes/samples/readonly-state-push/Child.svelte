<script>
	let { array } = $props();
</script>

{#each array as number}
	<p>{number}</p>
{/each}
