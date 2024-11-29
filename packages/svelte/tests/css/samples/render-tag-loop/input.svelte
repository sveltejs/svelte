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

<style>
	div div {
		color: green;
	}
	div + div {
		color: red; /* this is marked as unused, but only because we've written an infinite loop - worth fixing? */
	}
	div:has(div) {
		color: green;
	}
</style>
