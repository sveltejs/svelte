<script>
	export let value = 'a';
	export let untouched = 'a';
</script>

<select id="single" {value} onchange={(e) => (value = e.currentTarget.value)}>
	<option value="a">A</option>
	<option value="b">B</option>
	<option value="c">C</option>
</select>
<select id="untouched" value={untouched} onchange={(e) => (untouched = e.currentTarget.value)}>
	<option value="a">A</option>
	<option value="b">B</option>
</select>
