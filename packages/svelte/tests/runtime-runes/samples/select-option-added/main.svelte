<script>
	let options = $state([1, 2, 3]);
	let selected = $state(1);
</script>

<button onclick={() => options.push(options.length + 1)}>
	add option
</button>

<p>selected: {selected}</p>

<select bind:value={selected}>
	{#each options as o}
		<option>{o}</option>
	{/each}
</select>
