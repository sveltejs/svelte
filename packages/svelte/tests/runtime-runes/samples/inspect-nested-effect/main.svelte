<script>
	let a = $state(0);
	let b = $derived.by(() => {
		$effect(() => {
			a = 1;
		})
		return a;
	})

	$inspect(b);
</script>

