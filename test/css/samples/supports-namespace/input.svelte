<style>
	@namespace url(http://www.w3.org/1999/xhtml);
	@namespace svg url(http://www.w3.org/2000/svg);

	/* This matches all XHTML <a> elements, as XHTML is the default unprefixed namespace */
	:global(a) {
		color: blue;
	}

	/* This matches all SVG <a> elements */
	:global(svg|a) {
		color: green;
	}

	/* This matches both XHTML and SVG <a> elements */
	:global(*|a) {
		color: red;
	}
</style>
