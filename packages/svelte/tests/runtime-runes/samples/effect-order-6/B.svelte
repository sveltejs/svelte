<script>
	let { closed, close } = $props();

	$effect(() => {
		if (closed) close();
	});
</script>
