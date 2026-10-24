<script>
	let { fulfilled, rejected, unhandled } = $props();

	function boom(message) {
		throw new Error(message);
	}
</script>

<svelte:boundary>
	{#await fulfilled}
		<p>loading then</p>
	{:then}
		<p>{boom('then')}</p>
	{/await}
	{#snippet failed(error)}<p>failed: {error.message}</p>{/snippet}
</svelte:boundary>

<svelte:boundary>
	{#await rejected}
		<p>loading catch</p>
	{:catch}
		<p>{boom('catch')}</p>
	{/await}
	{#snippet failed(error)}<p>failed: {error.message}</p>{/snippet}
</svelte:boundary>

<svelte:boundary>
	{#await unhandled}
		<p>loading rejection</p>
	{/await}
	{#snippet failed(error)}<p>failed: {error.message}</p>{/snippet}
</svelte:boundary>
