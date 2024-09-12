<style>
	/* valid */
	:global(&) {
		color: blue;
	}
	:global(& div) {
		color: blue;
	}
	:global(&) div {
		color: blue;
	}
	/* error */
	:global(div &) {
		color: blue;
	}
</style>
