<script>
	let { id } = $props();

	// BUG: This logs 'undefined' on unmount when parent has async derived
	const data = $derived(await Promise.resolve(id).then((x) => {
		console.log('promise resolved with:', x);
		return x;
	}));
</script>
