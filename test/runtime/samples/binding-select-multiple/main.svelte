<script>
	export let selected;
</script>

<select multiple bind:value={selected}>
	<option>one</option>
	<option>two</option>
	<option>three</option>
</select>

<p>selected: {selected.join( ', ' )}</p>