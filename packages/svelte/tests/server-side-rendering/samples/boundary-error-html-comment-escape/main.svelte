<script>
	let { query } = $props();

	function search(q) {
		throw new Error(q);
	}
</script>

<svelte:boundary>
	<p>{search(query)}</p>

	{#snippet failed(error)}
		<p class="error">{error.message}</p>
	{/snippet}
</svelte:boundary>
