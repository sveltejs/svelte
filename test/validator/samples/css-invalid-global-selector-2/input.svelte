<style>
	div :global(:is(h1, h2)) {
		color: red;
	}
	div :global(:where(h1, h2)) {
		color: red;
	}
	div :global(h1 ~ :is(h2, h3)) {
		color: red;
	}
	div :global(:is(h1, h2), h3) {
		color: red;
	}
</style>

<div>
	<h1>hello world</h1>
</div>