<script>
	let available = [1, 2, 3, 4, 5];
	let taken = [2, 4];
</script>

<select>
	<option value="please choose">please choose</option>
	{#each available as a}
		<option disabled="{!!taken.find(f => f == a)}" value="{a}">{a}</option>
	{/each}
</select>
