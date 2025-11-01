component: loaded, boundary:

<svelte:boundary>
	{@const _ = await Promise.resolve()}
	loaded
	{#snippet pending()}
		loading
	{/snippet}
</svelte:boundary>
