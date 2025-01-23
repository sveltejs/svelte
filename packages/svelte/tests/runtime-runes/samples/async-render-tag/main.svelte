<script>
	let { promise } = $props();
</script>

{#snippet hello(message)}
	<h1>{message}</h1>
{/snippet}

<svelte:boundary>
	{@render hello(await promise)}

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
