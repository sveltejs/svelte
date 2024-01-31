<script>
	export let selected;
</script>

<p>selected: {selected}</p>

<select bind:value={selected}>
	<option disabled>x</option>
	{#each ["a", "b", "c"] as val}
		<option>{val}</option>
	{/each}
</select>
