<style>
	/* ok */
	div {
		&.y :global.x {
			color: red;
		}
	}

	/* not ok */
	:global.x {
		color: red;
	}
</style>
