<div>container query</div>

<style>
	div {
		container: test-container / inline-size;
	}

  /* Most common container query statements. */

	@container (min-width: 400px) {
		div {
			color: red;
		}
	}

	@container test-container (min-width: 410px) {
		div {
			color: green;
		}
	}

	@container test-container (width < 400px) {
		div {
			color: blue;
		}
	}

	@container test-container (0 <= width < 300px) {
		div {
			color: purple;
		}
	}

	@container not (width < 400px) {
		div {
			color: pink;
		}
	}

	@container (width > 400px) and (height > 400px) {
		div {
			color: lightgreen;
		}
	}

	@container (width > 400px) or (height > 400px) {
		div {
			color: lightblue;
		}
	}

	@container (width > 400px) and (width > 800px) or (orientation: portrait) {
		div {
			color: salmon;
		}
	}

	@container style(color: blue) {
		div {
			color: tan;
		}
	}

	@container test-container (min-width: calc(400px + 1px)) {
		div {
			color: green;
		}
	}

	@container test-container (width < clamp(200px, 40%, 400px)) {
		div {
			color: blue;
		}
	}

	@container test-container (calc(400px + 1px) <= width < calc(500px + 1px)) {
		div {
			color: purple;
		}
	}

	@container style(--var: calc(400px + 1px)) {
		div {
			color: sandybrown;
		}
	}
</style>
