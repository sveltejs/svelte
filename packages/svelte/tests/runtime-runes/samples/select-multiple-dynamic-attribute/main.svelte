<script>
	let multiple = $state(false);
	let value = $state(['b']);
</script>

<select {multiple} bind:value>
	<option value="a">a</option>
	<option value="b">b</option>
	<option value="c">c</option>
</select>

<button onclick={() => multiple = !multiple}>toggle</button>
