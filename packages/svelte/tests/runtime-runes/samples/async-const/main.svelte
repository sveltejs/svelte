<script>
	let name = $state('world');
</script>

<svelte:boundary>
	{#snippet pending()}
		<h1>Loading...</h1>
	{/snippet}

	{#snippet greet()}
		{@const greeting = await `Hello, ${name}!`}
		<h1>{greeting}</h1>
	{/snippet}

	{@render greet()}
</svelte:boundary>
