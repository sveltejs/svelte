<svelte:boundary>
	{#snippet failed(error)}
		<p>caught: {error}</p>
	{/snippet}

	{(() => {throw 'catch me'})()}
</svelte:boundary>
