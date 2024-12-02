<style>
	/* ok */
	div :global {
		&.x {
			color: red;
		}
	}
	div {
		:global {
			&.x {
				color: red;
			}
		}
	}

	/* not ok */
	:global {
		&.x {
			color: red;
		}
	}
</style>
