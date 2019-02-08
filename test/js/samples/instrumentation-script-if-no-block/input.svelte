<script>
	let x = 0;

	function foo() {
		if (true) x += 1;
	}
</script>

<button on:click={foo}>foo</button>

<p>x: {x}</p>