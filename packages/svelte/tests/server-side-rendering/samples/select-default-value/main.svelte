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

<select multiple="" defaultValue={['a', 'c']}>
	<option value="a">A</option>
	<option value="b">B</option>
	<option value="c">C</option>
</select>

<select defaultvalue="b">
	<option value="a">A</option>
	<option value="b">B</option>
</select>

<select {...{ defaultValue: 'b' }} defaultValue="a">
	<option value="a">A</option>
	<option value="b">B</option>
</select>
