<script>
	let label = $state('Value 1');
	let selected = $state('b');
</script>

<select>
	<button><selectedcontent></selectedcontent></button>
	<optgroup label="Group">
		<legend>Group</legend>
		<option><span>{label}</span></option>
	</optgroup>
</select>

<select bind:value={selected}>
	<button><selectedcontent></selectedcontent></button>
	<option value="a"><span>{label}</span></option>
	<option value="b"><span>Value 2</span></option>
</select>

<button id="update" onclick={() => label = 'Changed'}>Update</button>
<p>{selected}</p>
