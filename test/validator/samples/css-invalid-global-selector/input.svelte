<style>
	div :global(.h1\,h2\,h3) {
		color: red;
	}
	:global(h1, h2, h3) {
		color: red;
	}
	div, :global(h1, h2, h3) {
		color: red;
	}
	div :global(h1, h2, h3) {
		color: red;
	}
</style>

<div>
	<h1>hello world</h1>
</div>