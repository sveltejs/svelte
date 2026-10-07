<script>
	let { promise } = $props();

	const value = await promise;
</script>

<p>{await Promise.resolve(value)}</p>
