<script>
	let value;
	let multiple;
</script>

<!-- ok -->
<select bind:this={value} {multiple}>
	<option>1</option>
	<option>2</option>
	<option>3</option>
</select>

<!-- error -->
<select bind:value {multiple}>
	<option>1</option>
	<option>2</option>
	<option>3</option>
</select>