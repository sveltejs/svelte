<script>
	let value = $state('a');
	let bound = $state('a');
	let spread = $state('a');
	let props = { defaultValue: 'b' };
</script>

<select {value} defaultValue="b">
	<option value="a">A</option>
	<option value="b">B</option>
</select>

<select bind:value={bound} defaultValue="b">
	<option value="a">A</option>
	<option value="b">B</option>
</select>

<select {...props} bind:value={spread}>
	<option value="a">A</option>
	<option value="b">B</option>
</select>
