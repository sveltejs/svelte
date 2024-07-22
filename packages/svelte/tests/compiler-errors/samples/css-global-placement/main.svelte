<style>
	/* ok */
	div :global {
		p {
			color: green;
		}
	}
	div {
		:global {
			p {
				color: green;
			}
		}
	}
	div:global {
		&.x {
			color: green;
		}
	}

	/* not ok */
	div :global {
		&.x {
			color: red;
		}
	}
</style>
