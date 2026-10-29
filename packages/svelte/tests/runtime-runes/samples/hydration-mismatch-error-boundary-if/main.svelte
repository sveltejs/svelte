<script>
	let { browser } = $props();

	function boom() {
		throw new Error('client error');
	}
</script>

<svelte:boundary>
	{#if browser}<b>{boom()}</b>{/if}

	{#snippet failed(error)}
		<p>failed: {error.message}</p>
	{/snippet}
</svelte:boundary>

<section><span>after</span></section>
