<script>
	const props = { defaultValue: 'b' };
</script>

<select defaultValue="b">
	<option value="a">A</option>
	<option value="b">B</option>
</select>

<select {...props}>
	<option value="a">A</option>
	<option value="b">B</option>
</select>

<select defaultValue="b" value="a">
	<option value="a">A</option>
	<option value="b">B</option>
</select>
