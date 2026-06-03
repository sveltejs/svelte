<script>
	let value = $state(42);

	function shadow(output = value) {
		const value = 1337;
		return output;
	}

	console.log(shadow());
	value += 1;
	console.log(shadow());
</script>
