<svelte:boundary>
	{#each (await Promise.reject(new Error('oops'))) as x}
		hi
	{/each}

	{#snippet pending()}loading{/snippet}
	{#snippet failed()}oops{/snippet}
</svelte:boundary>
