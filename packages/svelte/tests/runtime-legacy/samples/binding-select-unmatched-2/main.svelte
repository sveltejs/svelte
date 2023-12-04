<script>
	// set as null so no option will be selected by default
	export let selected = null;
</script>

<p>selected: {selected}</p>

<select bind:value={selected}>
	{#each ['a', 'b', 'c'] as letter}
		<option>{letter}</option>
	{/each}
</select>

<p>selected: {selected}</p>
