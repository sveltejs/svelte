<script>
	let values = $state(['a', 'b']);
	let selected = $state('b');

	function double(value) {
		return value + value;
	}
</script>

<select value={selected}>
	{#each values as value}
		<option value={value}>{value}</option>
	{/each}
</select>

<select>
	{#each values as value}
		<option value={double(value)}>{value}</option>
	{/each}
</select>

<select>
	{#each values as value}
		<option value={undefined}>{value}</option>
	{/each}
</select>

<button onclick={() => (values = ['c', 'd'])}>update</button>
<button onclick={() => (selected = 'a')}>select</button>
