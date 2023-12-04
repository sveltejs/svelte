<style>
	:global(.h1\,h2\,h3)::foo {
		color: red;
	}
	:global(h1, h2, h3)::foo {
		color: red;
	}
</style>

<div>
	<h1>hello world</h1>
</div>