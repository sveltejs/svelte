<script>
	let { go, get } = $props();
	$effect(() => {
		console.log(`item effect: go=${go} name=${get()}`);
	});
</script>
