<script>
	let selected = $state(['c']);

	let defaultValue = $state(['a', 'c']);
</script>

<form>
	<!-- defaultValue=[a, c], no value: the default selection takes effect -->
	<select multiple {defaultValue}>
		<option value="a">A</option>
		<option value="b">B</option>
		<option value="c">C</option>
	</select>

	<!-- defaultValue=[a, c], value=[c]: the explicit value wins -->
	<select multiple {defaultValue} bind:value={selected}>
		<option value="a">A</option>
		<option value="b">B</option>
		<option value="c">C</option>
	</select>

	<input type="reset" value="Reset" />
</form>

<p>
	<span class="test-1">{selected.join(',')}</span>
</p>
