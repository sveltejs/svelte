<script>
	let things = [];

	function foo() {
		things.push(1);
		things = things;
	}
</script>

<button on:click={foo}>foo</button>

<p>number of things: {things.length}</p>