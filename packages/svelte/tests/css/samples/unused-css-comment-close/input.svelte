<p class="used" title="*/"></p>

<style>
	.unused[title="*/"] {
		content: '*/';
	}

	.unused[title="*/"], .used {
		color: red;
	}

	.used, .unused[title="*/"], .used {
		color: green;
	}

	.used, .unused[title="*/"] {
		color: blue;
	}

	.unused /* a */, .used {
		color: purple;
	}

	.used, .unused /* a */, .used {
		color: pink;
	}

	.used[title="*/"], .unused, .used {
		color: orange;
	}
</style>
