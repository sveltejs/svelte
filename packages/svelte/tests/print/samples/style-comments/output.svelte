<style>
	/* first */

	/* second */

	.foo, /* between */
	.bar /* trailing */ {
		/* block */
		color: r /* value */ ed;
	}

	@media screen/* media */and (width > 0) {
		/* nested */
		.baz {
			display: block;
		}
	}

	.empty {
		/* only */
	}

	.part::part(/* argument */ label) {
		display: block;
	}

	/* last */
</style>
