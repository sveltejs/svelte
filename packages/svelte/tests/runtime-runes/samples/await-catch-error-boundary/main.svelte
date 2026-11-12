<script>
	let { promise } = $props();

	function boom() {
		throw new Error('catch error');
	}
</script>

<svelte:boundary>
	{#await promise}
		<p>loading</p>
	{:catch}
		<p>{boom()}</p>
	{/await}

	{#snippet failed(error)}
		<p>failed: {error.message}</p>
	{/snippet}
</svelte:boundary>
