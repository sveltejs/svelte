<script>
	export let selected;
</script>

<p>selected: {selected}</p>

<select bind:value={selected}>
	<option>a</option>
	<option selected>b</option>
	<option>c</option>
</select>

<p>selected: {selected}</p>