<p class="used">this should be red</p>
<p class="also-used">also used</p>

<style>
	.unused, /* a, b */ .used {
		color: red;
	}

	.used, .unused /* a, b */, /* c, /* d */ /* e, f */ .also-used {
		color: red;
	}

	.unused, /* a, b */ .other-unused, /* c, d */ .used {
		color: red;
	}

	.used, .unused, /* a, b */ .other-unused {
		color: red;
	}

	:is(.unused, /* a, b */ .used) {
		color: red;
	}
</style>
