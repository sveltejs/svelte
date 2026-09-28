<!-- this is ok -->
{#snippet row1(item)}
{#if item}
{const item = 1}
<p>{item}</p>
{/if}
{/snippet}

{@render row1(5)}

<!-- this is not -->
{#snippet row2(item)}
	{const item = 1}
	<p>{item}</p>
{/snippet}

{@render row2(5)}
