<script>
	let value = 'bar';
	let value_bound = 'bar';
	let options = {};

	function loadOptions() {
		options = {
			foo: 'Foo',
			bar: 'Bar',
			baz: 'Baz',
		};
	}
</script>

<select {value}>
	{#each Object.entries(options) as [key, value] (key)}
		<option value={key}>
			{value}
		</option>
	{/each}
</select>

<select bind:value={value_bound}>
	{#each Object.entries(options) as [key, value] (key)}
		<option value={key}>
			{value}
		</option>
	{/each}
</select>

<button on:click={loadOptions}>
	Load options
</button>
