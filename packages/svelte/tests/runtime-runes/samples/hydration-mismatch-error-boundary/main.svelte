<script>
	let { browser, message = 'hello' } = $props();

	function boom() {
		throw new Error('oops');
	}
</script>

<svelte:boundary>
	{#if browser}
		{boom()}
	{/if}

	{#snippet failed(error)}
		<p>failed: {error.message}</p>
	{/snippet}
</svelte:boundary>

<p>{message}</p>
