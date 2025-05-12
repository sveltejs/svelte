<script>
	let { promise } = $props();

	let value = await promise;
</script>

<p>{value}</p>
