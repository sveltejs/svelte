<svelte:boundary>
	{#snippet failed(error)}
		<p>caught: {error}</p>
	{/snippet}

	{await Promise.reject('catch me')}
</svelte:boundary>
