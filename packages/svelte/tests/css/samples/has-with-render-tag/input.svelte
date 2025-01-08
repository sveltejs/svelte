{#snippet foo()}
	<y></y>
{/snippet}

<x>
	this should be green
	{@render foo()}
</x>

<z>
	<p>this should be green</p>
	{@render foo()}
</z>

<style>
	x:has(y) {
		color: green;
	}
	p:has(+ y) {
		color: green;
	}

	z:has(+ y) {
		color: red;
	}
</style>
