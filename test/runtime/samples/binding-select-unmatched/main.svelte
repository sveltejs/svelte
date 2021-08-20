<script>
	// set as null so no option will be selected by default
	export let selected = null;
</script>

<p>selected: {selected}</p>

<select bind:value={selected}>
	<option>a</option>
	<option>b</option>
	<option>c</option>
</select>

<p>selected: {selected}</p>