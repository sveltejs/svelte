<script>
	let { getValue } = $props();

	// Reads reactive state during teardown, like bits-ui popovers/tooltips do.
	$effect(() => {
		return () => {
			getValue();
		};
	});
</script>

<span>trigger</span>
