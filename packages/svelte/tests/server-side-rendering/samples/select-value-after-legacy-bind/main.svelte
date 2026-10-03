<script>
	import Row from './Row.svelte';
	let selected = 'b';
</script>

<select bind:value={selected}>
	<option value="a">a</option>
	<Row />
	<option value="b">b</option>
	<option value="c">c</option>
</select>
