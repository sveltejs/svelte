<script>
	let { promise } = $props();
</script>

<svelte:boundary>
	<h1>{await promise}</h1>

	{#snippet pending()}
		<p>pending</p>
	{/snippet}

	{#snippet failed(error, reset)}
		<p>{error.message}</p>
		<button onclick={reset}>reset</button>
	{/snippet}
</svelte:boundary>
