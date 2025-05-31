<script>
	let { promise } = $props();
</script>

<svelte:boundary>
	<h1>{@html await promise}</h1>

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
