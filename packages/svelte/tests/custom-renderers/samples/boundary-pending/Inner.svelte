<script>
	let { promise } = $props();
	let value = $derived(await promise);
</script>

<p>{value}</p>
