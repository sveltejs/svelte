<script>
	let condition = $state(false);
	let count = $state(0);

	$effect(() => {
		if (condition) {
			count++;
		}
	});
</script>

<button onclick={() => condition = !condition}>toggle</button>
