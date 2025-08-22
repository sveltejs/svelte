<script>
	let name = $state('world');
</script>

<svelte:boundary>
	{@const number = await Promise.resolve(5)}

	{#snippet pending()}
		<h1>Loading...</h1>
	{/snippet}

	{#snippet greet()}
		{@const greeting = await `Hello, ${name}!`}
		<h1>{greeting}</h1>
		{number}
		{#if number > 4}
			{@const length = await number}
			{#each { length }, index}
				{@const i = await index}
				{i}
			{/each}
		{/if}
	{/snippet}

	{@render greet()}
</svelte:boundary>
