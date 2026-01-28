<script>
	await 1;

    // Test function declaration style
	let value = $state('');
	function getValue() { return value }
	function setValue(v) { value = v }
</script>

<input bind:value={getValue, setValue} />
<p>{getValue()}</p>
