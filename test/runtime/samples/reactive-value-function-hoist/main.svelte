<script>
	let num = 2;
	$: square = num * num;

	function onClick() {
		this.innerHTML = square;
	}
</script>

<button on:click={onClick}>Click me</button>
