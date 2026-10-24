<script>
	let { promise } = $props();

	function boom() {
		throw new Error('pending');
	}
</script>

<svelte:boundary>
	{#await promise}
		<p>{boom()}</p>
	{:then}
		<p>resolved</p>
	{/await}
	{#snippet failed(error)}<p>failed: {error.message}</p>{/snippet}
</svelte:boundary>
