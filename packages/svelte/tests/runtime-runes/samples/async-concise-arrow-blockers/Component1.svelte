<script>
	await 1;

	// Test a concise arrow body that returns a function
	let value = $state('');
	const getValue = () => () => value;
	const setValue = () => (v) => { value = v };
</script>

<input bind:value={getValue(), setValue()} />
<p>{getValue()()}</p>
