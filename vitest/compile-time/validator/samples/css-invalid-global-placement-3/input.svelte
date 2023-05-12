<style>
	.foo :global(.bar)::after {
		color: red;
	}
	.foo :global(.bar)::after .baz {
		color: red;
	}
</style>
