<script>
	let { closed, close } = $props();

	$effect.pre(() => {
		if (closed) close();
	});
</script>
