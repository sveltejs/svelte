<script>
	let object = { value: 'hello' };
</script>

<input bind:value={object.value} />
<p>{object.value}</p>
