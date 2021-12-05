<script>
	export let selected;
	export let items;
</script>

<select value={selected} on:blur={e => selected = e.target.value}>
	{#each items as item}
		<option>{item}</option>
	{/each}
</select>

<p>selected: {selected || 'nothing'}</p>