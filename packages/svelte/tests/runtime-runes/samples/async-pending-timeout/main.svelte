<script>
	let { promise } = $props();
</script>

<svelte:boundary>
	<h1>{await promise}</h1>

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
