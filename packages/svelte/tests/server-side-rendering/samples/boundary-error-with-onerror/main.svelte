<script>
	function throws() {
		throw new Error('you are not supposed to see this message');
	}
</script>

<svelte:boundary>
	<p>{throws()}</p>

	{#snippet failed(error)}
		<p>caught: {error}</p>
	{/snippet}
</svelte:boundary>
