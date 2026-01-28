{#snippet a()}
	{@render b()}
	<div>
		{@render b()}
	</div>
{/snippet}

{#snippet b()}
	{@render a()}
	<div>
		{@render a()}
	</div>
{/snippet}

{#snippet c()}
	<span></span>
	{@render c()}
{/snippet}

<style>
	div div {
		color: green;
	}
	div + div {
		color: green;
	}
	div:has(div) {
		color: green;
	}
	span:has(~span) {
		color: green;
	}
</style>
