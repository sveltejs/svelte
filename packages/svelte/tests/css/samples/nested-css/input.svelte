<div class="a">
	<div class="a"></div>

	<div class="b">
		<div class="c"></div>
	</div>

	<div class="d"></div>
</div>

<div class="container">
	<div class="a"></div>
</div>

<style>
	.a {
		color: green;

		/* implicit & */
		.b, .unused {
			color: green;

			.c {
				color: green;
			}

			.unused {
				color: red;

				.c {
					color: red;
				}
			}
		}

		.d {
			.unused {
				color: red;
			}
		}

		/* explicit & */
		& .b {
			color: green;

			.c {
				& & {
					color: red;
				}
			}
		}

		& & {
			color: green;
		}

		/* silly but valid */
		&& {
			color: green;
		}

		.container & {
			color: green;
		}

		&.b {
			color: red;
		}

		.unused {
			color: red;
		}
	}

	:global(blah) {
		.a {
			color: green;
		}
	}
</style>
