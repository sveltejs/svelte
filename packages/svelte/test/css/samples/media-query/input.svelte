<div class='large-screen'>animated</div>

<style>
	@media (min-width: 400px) {
		.large-screen {
			display: block;
		}
	}

	@media (min-width: calc(400px + 1px)) {
		.large-screen {
			display: block;
		}
	}

	@media (width >= 600px) {
		.large-screen {
			display: block;
		}
	}

	@media (400px <= width <= 1000px) {
		.large-screen {
			display: block;
		}
	}

	@media (width < clamp(200px, 40%, 400px)) {
		.large-screen {
			display: block;
		}
	}

	@media (calc(400px + 1px) <= width <= calc(1000px + 1px)) {
		.large-screen {
			display: block;
		}
	}
</style>
