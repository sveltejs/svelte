<script>
	let array = $state([1, 2, 3]);

	function addToArray() {
		array.push(array.length + 1);
	}
</script>

<button onclick={addToArray}>add</button>

<span>{array}</span>
