<script>
	let value = $state('a');
	const options = [
		{ value: 'a', label: 'a' },
		{ value: undefined, label: 'undefined' },
		{ value: null, label: 'null' }
	];
</script>

<select bind:value>
	{#each options as { value, label, ...rest }}
		<option {value} {...rest}>{label}</option>
	{/each}
</select>

<p>{typeof value} {String(value)}</p>
