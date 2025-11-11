<script>
	await 1;

	let value = $state('');

	// getValue is declared BEFORE x
	function getValue() { 
		return x()
	}

	function x() {
		return value;
	}

	function setValue(v) { value = v }
</script>

<input bind:value={getValue, setValue} />
<p>{getValue()}</p>
