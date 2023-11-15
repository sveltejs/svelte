<script>
	let count = $state(0);

	$effect(() => {
		if (count > 0 && count < 5) {
			count++
		}
	});
</script>

<button on:click={() => count++}>{count}</button>
