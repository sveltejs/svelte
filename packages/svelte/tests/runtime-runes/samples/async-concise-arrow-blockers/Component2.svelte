<script>
	await 1;

	// Test a concise arrow body that takes an argument, as in an `{#each}` block
	let values = $state({ a: '' });
	const getValue = (key) => () => values[key];
	const setValue = (key) => (v) => { values[key] = v };
</script>

<input bind:value={getValue('a'), setValue('a')} />
<p>{getValue('a')()}</p>
