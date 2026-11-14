<script>
	let { push } = $props();

	$effect(() => {
		console.log('effect');
	});
</script>

<span>{await push('child', 1)}</span>
