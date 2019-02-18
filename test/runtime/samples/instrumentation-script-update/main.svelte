<script>
	let x = 0;

	function foo() {
		x++;
	}
</script>

<button on:click={foo}>foo</button>

<p>x: {x}</p>