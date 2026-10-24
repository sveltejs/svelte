<script>
	const value = $derived(await Promise.resolve('child'));
</script>

<p>{value}</p>
