{#snippet pending()}
	Loading...
{/snippet}

<svelte:boundary pending={pending}>
	{@const data = await Promise.resolve('hello')}
	<p>{data}</p>
</svelte:boundary>