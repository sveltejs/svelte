<script>
	function boom() {
		throw new Error('pending error');
	}
</script>

<svelte:boundary>
	{#await new Promise(() => {})}
		<p>{boom()}</p>
	{/await}

	{#snippet failed(error)}
		<p>failed: {error.message}</p>
	{/snippet}
</svelte:boundary>
