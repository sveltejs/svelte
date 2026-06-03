<style>
	/* valid */
	/* We gotta allow `:global x, :global y` and the likes because CSS preprocessors might generate that from e.g. `:global { x, y {...} }` */
	:global .x, :global .y {}
	.x :global, .y :global {}

	/* invalid */
	.x :global, .y {}
</style>
