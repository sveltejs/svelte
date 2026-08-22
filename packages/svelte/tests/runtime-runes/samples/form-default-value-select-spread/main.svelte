<script>
	let props1 = $state({ defaultValue: 'b' });
	let props2 = $state({ defaultValue: 'b', value: 'c' });

	let selected = $state();
</script>

<form>
	<!-- spread carrying defaultValue, no value -->
	<select {...props1} bind:value={selected}>
		<option value="a">A</option>
		<option value="b">B</option>
		<option value="c">C</option>
	</select>

	<!-- spread carrying both, value wins -->
	<select {...props2}>
		<option value="a">A</option>
		<option value="b">B</option>
		<option value="c">C</option>
	</select>

	<input type="reset" value="Reset" />
</form>

<p><span class="test-1">{selected}</span></p>
