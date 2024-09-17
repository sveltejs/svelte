<svelte:options runes={true} />

<!-- ok -->
{#if true}{#if true}{/if}{/if}
{#if foo}{:else if bar}{/if}
{#if foo}{:else}{/if}

<!-- prettier-ignore -->
<div>
	{ #if true}
		<p>hi</p>
	{/if}
</div>
