<script>
	let { promise } = $props();

	let d = $derived({
		value: await promise
	});
</script>

<p>{(await d).value}</p>
