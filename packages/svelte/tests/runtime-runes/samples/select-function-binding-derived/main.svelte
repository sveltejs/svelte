<script>
	let source = $state('b');
	let value = $derived(source);
</script>

<select bind:value={() => value, (next) => (value = next)}>
	<option value="a">a</option>
	<option value="b">b</option>
</select>
