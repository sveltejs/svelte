<script>
	const { count } = $props();

	const d = $derived.by(() => {
		if (count === 1) {
			throw new Error('kaboom')
		}
		return count
	});

	$effect(() => {
		d;
	});
</script>
