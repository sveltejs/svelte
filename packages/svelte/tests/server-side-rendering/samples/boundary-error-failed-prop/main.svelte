<script>
	function throws() {
		throw new Error('you are not supposed to see this message');
	}
</script>

{#snippet failed(error)}
	<p>caught: {error}</p>
{/snippet}

<svelte:boundary {failed}>
	<p>{throws()}</p>
</svelte:boundary>
