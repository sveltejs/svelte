<script>
	let promise = getNumbers();
	let selected = 2;

	async function getNumbers() {
		await new Promise(resolve => setTimeout(resolve, 100));
		return [1, 2, 3];
	}
</script>

<select bind:value={selected}>
	{#await promise}
		<option>-1</option>
	{:then numbers}
		{#each numbers as number}
			<option>{number}</option>
		{/each}
	{/await}
</select>
