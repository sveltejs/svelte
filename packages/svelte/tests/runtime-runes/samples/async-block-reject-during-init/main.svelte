<svelte:boundary>
	{#if await Promise.reject(new Error('nope'))}
		hi
	{/if}

	{#snippet pending()}loading{/snippet}
	{#snippet failed(e)}{e.message}{/snippet}
</svelte:boundary>
