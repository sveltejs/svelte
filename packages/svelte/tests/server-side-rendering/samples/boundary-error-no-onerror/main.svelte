<script>
	function throws() {
		throw new Error('component error');
	}
</script>

<svelte:boundary>
	<p>{throws()}</p>

	{#snippet failed(error)}
		<p>caught: {error}</p>
	{/snippet}
</svelte:boundary>
