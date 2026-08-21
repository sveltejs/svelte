<script>
	await 1;

    // Test arrow function style
	let value = $state('');
	const getValue = () => { 
		return value;
	};
	const setValue = (v) => { value = v }
</script>

<input bind:value={getValue, setValue} />
<p>{getValue()}</p>
