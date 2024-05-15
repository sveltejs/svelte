<script>
	let items = [{}];
	let data = $state();

	$effect(() => {
		data = items.slice(0, 1);
	});

	$inspect(data);
</script>

