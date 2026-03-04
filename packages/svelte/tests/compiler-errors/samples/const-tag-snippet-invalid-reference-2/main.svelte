<svelte:options runes />

<!-- ok -->
<Component>
	{@const foo = 'bar'}
	{foo}

	<Component>
		{#snippet prop()}
			{foo}
		{/snippet}
	</Component>

	{#snippet prop()}
		{@const foo = 'bar'}
		{foo}
	{/snippet}
</Component>

<!-- error -->
<Component>
	{@const foo = 'bar'}

	{#snippet prop()}
		{foo}
	{/snippet}
</Component>
