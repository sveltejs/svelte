<script>
	let { promise } = $props();
</script>

<svelte:boundary>
	{#if await promise}
		<h1>yes</h1>
	{:else}
		<h1>no</h1>
	{/if}

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
