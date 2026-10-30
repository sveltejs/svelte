<script>
	let { initialized, replace } = $props();
	let done = false;

	$effect(() => {
		if (!initialized || done) return;
		done = true;
		replace();
	});
</script>
