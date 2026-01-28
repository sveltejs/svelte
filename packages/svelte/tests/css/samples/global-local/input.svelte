<div>{@html whatever}</div>

<style>
	div :global(.whatever) {
		color: green;
	}

	:global(.whatever) div {
		color: green;
	}
</style>
