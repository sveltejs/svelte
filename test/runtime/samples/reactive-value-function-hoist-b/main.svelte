<script>
	let array = ['a', 'b', 'c'];
	$: uppercase = array.map(str => str.toUpperCase());

	function onClick() {
		this.innerHTML = uppercase.join(',');
	}
</script>

<button on:click={onClick}>Click me</button>
