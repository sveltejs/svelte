<style>
	div :global(:is(div, h1)) {
		color: red;
	}
	div :global(:where(div, h1)) {
		color: red;
	}
	div :global(div > :where(h1, h2)) {
		color: red;
	}
	div :global(.h1\,h2\,h3) {
		color: red;
	}
	div :global(h1, h2, h3) {
		color: red;
	}
</style>

<div>
	<h1>hello world</h1>
</div>