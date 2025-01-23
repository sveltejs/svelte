<script>
	let { promise, num } = $props();

	let value = $derived((await promise) * num);

	$effect(() => {
		console.log('should run');
	});

	$effect(() => {
		console.log(value, num);
	});
</script>

<p>{value}</p>
