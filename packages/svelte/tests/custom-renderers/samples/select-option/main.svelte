<script>
	let selected = $state('b');
</script>

<select value={selected}>
	<option value="a">A</option>
	<option value="b">B</option>
	<option value="c">C</option>
</select>
<p>{selected}</p>
