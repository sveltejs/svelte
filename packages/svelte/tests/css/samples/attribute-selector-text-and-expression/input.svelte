<script>
	let { open = true } = $props();
</script>

<button aria-label="{open ? 'Close' : 'Open'} menu"></button>
<input placeholder="{open ? 'Name' : 'Email'} here">
<p title="{open ? 'a' : 'b'} and {open ? 'c' : 'd'}"></p>
<a href="/docs/{open ? 'a' : 'b'}/intro">docs</a>

<style>
	button[aria-label='Close menu'] {
		color: red;
	}

	input[placeholder^='Email h'] {
		color: red;
	}

	input[placeholder$='e here'] {
		color: red;
	}

	input[placeholder*='l he'] {
		color: red;
	}

	p[title='b and c'] {
		color: red;
	}

	button[aria-label='Close door'] {
		color: blue;
	}

	p[title='a and e'] {
		color: blue;
	}

	a[href='/docs/c/intro'] {
		color: blue;
	}
</style>
