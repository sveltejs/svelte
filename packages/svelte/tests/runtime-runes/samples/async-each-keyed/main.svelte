<script>
	let { promise } = $props();
</script>

<svelte:boundary>
	{#each await promise as item (item)}
		<p>{item}</p>
	{/each}

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
