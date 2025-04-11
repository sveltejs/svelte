<div>
	<Comp foo={bar}
</div>

<div>
	<span foo={bar}
</div>

{#if foo}
	<Comp foo={bar}
{/if}

{#if foo}
	<Comp foo={bar}
	{#if bar}
		{bar}
	{/if}
{/if}

<div foo={bar}