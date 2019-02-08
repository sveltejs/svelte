<script>
	let x = 0;

	function foo() {
		(() => {
			for (let x = 0; x < 10; x++) {}
			x = 42;
		})();
	}
</script>

<button on:click={foo}>foo</button>

<p>x: {x}</p>