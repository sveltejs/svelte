{#snippet a()}
	<div>
		{@render b()}
	</div>
{/snippet}

{#snippet b()}
	<div>
		{@render a()}
	</div>
{/snippet}

<style>
	div div {
		color: red;
	}
</style>
