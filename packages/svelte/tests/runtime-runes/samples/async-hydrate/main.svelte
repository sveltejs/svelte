<svelte:boundary>
	<p>{await Promise.resolve('hello')}</p>

	{#snippet pending()}
		<p>Loading...</p>
	{/snippet}
</svelte:boundary>
