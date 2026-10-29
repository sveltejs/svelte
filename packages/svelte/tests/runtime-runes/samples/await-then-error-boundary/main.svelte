<script>
	let { promise } = $props();

	function boom() {
		throw new Error('then error');
	}
</script>

<svelte:boundary>
	{#await promise}
		<p>loading</p>
	{:then}
		<p>{boom()}</p>
	{/await}

	{#snippet failed(error)}
		<p>failed: {error.message}</p>
	{/snippet}
</svelte:boundary>
