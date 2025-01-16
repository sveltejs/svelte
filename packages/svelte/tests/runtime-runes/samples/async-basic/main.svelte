<script>
	let { promise } = $props();
</script>

<svelte:boundary>
	<p>{await promise}</p>

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
