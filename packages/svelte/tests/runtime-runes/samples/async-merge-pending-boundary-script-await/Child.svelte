<script>
	let { push } = $props();

	$effect(() => {
		console.log('effect');
	});

	const v = await push('child', 1);
</script>

<span>{v}</span>
