<style>
	/* ok */
	.x > :global.x > p {
	}
	.x > :global p > p {
	}

	/* not ok */
	.x > :global > p {
	}
</style>
