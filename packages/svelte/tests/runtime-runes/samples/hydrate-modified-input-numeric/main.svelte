<script>
	let value = $state(0);
</script>

<input type="number" bind:value={value}>
{value} ({typeof value})
