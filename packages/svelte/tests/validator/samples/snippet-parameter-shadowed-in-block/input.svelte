{#snippet row(item)}
	{#if item}
		{const item = 1}
		<p>{item}</p>
	{/if}
{/snippet}

{@render row(5)}
