<script>
	let { promise } = $props();
</script>

<svelte:boundary>
	{#each await promise as item}
		<p>{item}</p>
	{/each}

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
