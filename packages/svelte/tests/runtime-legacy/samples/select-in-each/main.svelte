<script>
	let entries = [{selected: 'a' }]
</script>

{#each entries as entry}
	<select bind:value={entry.selected}>
		<option value='a'>A</option>
		<option value='b'>B</option>
	</select>
	selected: {entry.selected}
{/each}
