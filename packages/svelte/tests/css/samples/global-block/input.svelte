<div>{@html whatever}</div>

<style>
	:global {
		.x {
			color: green;
		}
	}

	div :global {
		.y {
			color: green;
		}
	}

	.unused :global {
		.z {
			color: red;
		}
	}
</style>
