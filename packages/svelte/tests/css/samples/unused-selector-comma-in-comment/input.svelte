<p class="used"></p>

<style>
	.unused, /* a, b */ .used {
		color: red;
	}

	.used, .unused, /* a, b */ .used {
		color: green;
	}

	.unused, .unused2, /* a, b */ .used {
		color: blue;
	}

	.unused <!-- a, b -->, .used {
		color: purple;
	}
</style>
