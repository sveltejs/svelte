<style>
	.foo :global(.bar):first-child {
		color: red;
	}
	.foo :global(p):first-child {
		color: red;
	}
	.foo :global(.bar):first-child .baz {
		color: red;
	}
</style>
