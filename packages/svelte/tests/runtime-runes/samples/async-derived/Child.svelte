<script>
	let { promise, num } = $props();

	let value = $derived((await promise) * num);
</script>

<p>{value}</p>
