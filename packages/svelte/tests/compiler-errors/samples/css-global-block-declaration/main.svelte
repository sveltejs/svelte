<style>
	/* ok */
	.x :global {
		color: red;
	}

	:global .y {
		color: red;
	}

	/* not ok */
	:global {
		color: red;
	}
</style>
