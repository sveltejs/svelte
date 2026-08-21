<svelte:boundary>
	{@const data = await Promise.resolve("works")}
	{@debug data}
</svelte:boundary>