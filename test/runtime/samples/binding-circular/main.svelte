<script>
	let obj = {};
	obj.self = obj;

	let selected = obj;
</script>

<select bind:value={selected}>
	<option value={obj}>wheeee</option>
</select>