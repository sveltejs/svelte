<script>
	export let foo;
	export let items;
</script>

<select bind:value={foo} required>
	<option value={null} disabled>Select an option</option>
	{#each items as item}
		<option value={item}>{item.id}</option>
	{/each}
</select>
