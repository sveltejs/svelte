<script>
	let { promise } = $props();
</script>

<svelte:boundary>
	<svelte:element this={await promise}>hello</svelte:element>

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
