<script>
	let { promise } = $props();
</script>

<svelte:boundary>
	<p class={await promise}>hello</p>

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
