<svelte:options runes />

<!-- ok -->
<svelte:boundary>
	{@const foo = 'bar'}

	{#snippet other()}
		{foo}
	{/snippet}

	{foo}

	<svelte:boundary>
		{#snippet failed()}
			{foo}
		{/snippet}
	</svelte:boundary>

	{#snippet failed()}
		{@const foo = 'bar'}
		{foo}
	{/snippet}
</svelte:boundary>

<!-- error -->
<svelte:boundary>
	{@const foo = 'bar'}

	{#snippet failed()}
		{foo}
	{/snippet}
</svelte:boundary>
