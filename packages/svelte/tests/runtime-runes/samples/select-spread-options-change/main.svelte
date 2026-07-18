<script>
	let props = { 'data-testid': 'select' };
	let options = $state(['a', 'b']);
</script>

<button onclick={() => (options = [...options, 'c'])}>add</button>

<select {...props}>
	{#each options as option}
		<option value={option}>{option}</option>
	{/each}
</select>
