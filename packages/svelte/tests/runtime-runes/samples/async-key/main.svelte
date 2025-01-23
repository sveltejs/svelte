<script>
	let { promise } = $props();
</script>

<svelte:boundary>
	{#key await promise}
		<h1>hello</h1>
	{/key}

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
