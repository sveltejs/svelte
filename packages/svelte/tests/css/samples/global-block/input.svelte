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

	/* some css preprocessors de-nest :global blocks with a single child
	   (e.g turn `:global { div { ... } }` into `:global div { ... }`),
	   so we need to support it, too */
	:global div {
		.y {
			color: green;
		}
	}

	div :global p {
		.y {
			color: green;
		}
	}

	/* `div { :global { &.x { ...} } }` is allowed ... */
	div {
		:global {
			&.x {
				color: green;
			}
		}
	}

	/* ...wich is equivalent to `div :global { &.x { ...} }` ... */
	div :global {
		&.x {
			color: green;
		}
	}

	/* ...so `div :global.x` must be, too ... */
	div :global.x {
		color: green;
	}

	/* ...and therefore `div { :global.x { ... }` aswell */
	div {
		:global.x {
			color: green;
		}
	}

	div {
		& :global.x {
			color: green;
		}
	}

	div :global:is(html.dark-mode *) {
		color: green;
	}

	.unused :global {
		.z {
			color: red;
		}
	}
</style>
