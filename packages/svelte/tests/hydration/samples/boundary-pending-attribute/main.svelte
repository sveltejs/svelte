{#snippet pending()}
	loading...
{/snippet}

<svelte:boundary {pending}>
	{@const data = await Promise.resolve("data")}
	{data}
</svelte:boundary>