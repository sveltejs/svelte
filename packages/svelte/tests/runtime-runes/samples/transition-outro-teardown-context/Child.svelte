<script>
	let { show } = $props();

	$effect(() => {
		return () => {
			console.log('show', show);
		};
	});
</script>

<p>child</p>
