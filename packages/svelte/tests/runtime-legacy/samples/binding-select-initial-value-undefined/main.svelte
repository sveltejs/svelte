<script>
	export let selected;
</script>

<p>selected: {selected}</p>

<select bind:value={selected}>
	<option disabled>x</option>
	<option>a</option>
	<option>b</option>
	<option>c</option>
</select>

<p>selected: {selected}</p>