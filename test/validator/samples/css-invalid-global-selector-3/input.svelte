<style>
	div :global(h1[data-title="Hello, world!"]) {
		color: red;
	}
	div :global(h1[attribute], video[autoplay]) {
		color: red;
	}
</style>

<div>
	<h1>hello world</h1>
</div>
