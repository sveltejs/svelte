<script>
	let count = $state(0);

	$effect(() => {
		if (count < 5) {
			count++;
		}
	});
</script>

{count}
