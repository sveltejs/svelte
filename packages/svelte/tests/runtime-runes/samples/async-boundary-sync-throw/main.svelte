<script>
	let valid = $state(true);

	function load() {
		if (!valid) throw new Error('original error');
		return Promise.resolve('ready');
	}
</script>

<button onclick={() => (valid = false)}>invalidate</button>

<svelte:boundary>
	<p>{await load()}</p>

	{#snippet pending()}<p>pending</p>{/snippet}
	{#snippet failed(error)}<p>{error.message}</p>{/snippet}
</svelte:boundary>
