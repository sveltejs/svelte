<script>
	let selected = $state('a');
	let label_a = $state('Option');
	let label_b = $state('Strong');
</script>

<select bind:value={selected}>
	<option value="a"><span>{label_a}</span> A</option>
	<option value="b"><strong>{label_b}</strong> B</option>
	<option value="c">Plain C</option>
</select>

<p>Selected: {selected}</p>

<button onclick={() => label_a = 'Changed'}>Change A</button>
