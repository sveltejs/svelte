<script>
	let { go, clear } = $props();
	$effect(() => {
		if (go) clear();
	});
</script>
