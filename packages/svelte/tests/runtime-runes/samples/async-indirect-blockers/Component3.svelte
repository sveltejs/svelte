<script>
	await 1;

    // Test indirect blocker dependencies
	let value = $state('');
	function x() {
		return value;
	}
	function getValue() { 
		return x()
	}
	function setValue(v) { value = v }
</script>

<input bind:value={getValue, setValue} />
<p>{getValue()}</p>
