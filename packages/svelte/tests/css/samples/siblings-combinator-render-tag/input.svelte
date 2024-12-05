{#snippet foo()}
	<p>this should be green</p>
{/snippet}

<h1>Hello</h1>

{@render foo()}

<style>
	h1 + p {
		color: green;
	}
</style>
