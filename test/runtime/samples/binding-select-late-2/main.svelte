<script>
	export let selected;
	export let items;
</script>

<select bind:value={selected}>
	{#each items as item}
		<option>{item}</option>
	{/each}
</select>

<p>selected: {selected || 'nothing'}</p>