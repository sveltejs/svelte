<script>
	let { items } = $props();
</script>

<svelte:boundary>
	{#each items as deferred}
		<p>{await deferred.promise}</p>
	{/each}

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
