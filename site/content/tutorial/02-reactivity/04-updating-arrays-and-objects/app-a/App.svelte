<script>
	let numbers = [1, 2, 3, 4];

	function addNumber(value) {
		numbers.push(value);
	}

	$: sum = numbers.reduce((t, n) => t + n, 0);
</script>

<p>{numbers.join(' + ')} = {sum}</p>

<button on:click={addNumber}>
	Add a number
</button>
