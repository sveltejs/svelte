<script>
	let name = $state('world');
</script>

<svelte:boundary>
	{@const sync = 'sync'}
	{@const number = await Promise.resolve(5)}
	{@const after_async = number + 1}
	{@const { length, 0: first } = await '01234'}

	{#snippet greet()}
		{@const greeting = await `Hello, ${name}!`}
		<h1>{greeting}</h1>
		{number}
		{#if number > 4 && after_async && greeting}
			{@const length = await number}
			{#each { length }, index}
				{@const i = await index}
				{i}
			{/each}
		{/if}
	{/snippet}

	{@render greet()}
	{number} {sync} {after_async} {length} {first}

	{#if sync}
		{@const double = number * 2}
		{double}
	{/if}
</svelte:boundary>
