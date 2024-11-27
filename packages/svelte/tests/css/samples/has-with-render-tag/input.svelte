{#snippet foo()}
	<y></y>
{/snippet}

<x>
	this should be green
	{@render foo()}
</x>

<style>
	x:has(y) {
		color: green;
	}
</style>
