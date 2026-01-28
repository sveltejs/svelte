<script>
	let count = $state(0);

	$effect.pre(() => {
		if (count > 1) {
			throw new Error('too high');
		}
	});
</script>

{count}

<button onclick={() => count++}>+</button>
