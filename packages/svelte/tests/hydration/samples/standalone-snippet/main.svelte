{#snippet thing()}
	<p>thing</p>
{/snippet}

{#if true}
	{@render thing()}
{/if}

{#each [1, 2, 3] as n}
	{@render thing()}
{/each}
