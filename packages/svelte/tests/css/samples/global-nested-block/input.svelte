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
