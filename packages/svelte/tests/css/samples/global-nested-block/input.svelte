<div><p>{@html whatever}</p></div>

<style>
	div {
		:global {
			.x {
				color: green;
			}
		}

		:global(.x) {
			color: green;
			&:hover {
				color: green;
			}
			&div {
				color: green;
			}
			.unused {
				color: red;
			}
		}

		p :global {
			.y {
				color: green;
			}
		}

		p :global(.y) {
			color: green;
		}

		.unused :global {
			.z {
				color: red;
			}
		}

		.unused :global(.z) {
			color: red;
		}
	}
</style>
