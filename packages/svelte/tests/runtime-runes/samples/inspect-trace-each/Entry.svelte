<script>
	let { entry } = $props();

	$effect(() => {
		$inspect.trace('effect');
		entry;
	});
</script>
