<script>
	export let selected;
	export let items = ['a', 'b', 'c'];
</script>

<p>selected: {selected}</p>

<select bind:value={selected}>
	{#each items as letter}
		<option>{letter}</option>
	{/each}
</select>
