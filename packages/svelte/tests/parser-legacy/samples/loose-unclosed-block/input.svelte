<div>
	{#if foo}
</div>

<Comp>
	{#key bar}
</Comp>

<div>
	{#if foo}
		{#if bar}
	{/if}
</div>

{#if foo}
	{#key bar}
{/if}

{#each x as y}
<p>hi</p>
