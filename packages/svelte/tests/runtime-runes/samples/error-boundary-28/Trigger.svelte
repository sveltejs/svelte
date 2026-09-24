<script>
	let { getValue } = $props();

	// Reads reactive state during teardown
	$effect(() => {
		return () => {
			getValue();
		};
	});
</script>

<span>trigger</span>
